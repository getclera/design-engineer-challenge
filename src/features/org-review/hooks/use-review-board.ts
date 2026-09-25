"use client";

import { HELD_ACTION_WINDOW_MS, useHeldAction, useTalentImpressions } from "@v2/features/org-shared-cards";
import { useDeferredEntityChips } from "@v2/hooks/use-deferred-entity-chips";
import { useRolesList } from "@v2/features/org-roles";
import { INTRO_DECISION_CATEGORIES, PASS_DECISION_CATEGORIES } from "@v2/features/org-shared-modals";
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { orgTalents } from "@/services/api/org-talents";
import { isHmLinkWarningSuppressed } from "../hm-warning-cookie";
import { sortByQueue } from "../review-queue";
import {
	REVIEW_STREAMS,
	type ReviewItem,
	type ReviewListData,
	type ReviewStream,
	reviewItemKey,
	streamOf,
} from "../types";
import { useReverseReviewPass } from "./use-reverse-review-pass";
import { useReviewAction } from "./use-review-action";
import { useReviewItems } from "./use-review-items";
import { useRoleIntroReadiness } from "./use-role-intro-readiness";
import { useSimilarFollowThrough } from "./use-similar-follow-through";
import { useSimilarPicks } from "./use-similar-picks";

export type ReviewDecisionKind = "intro" | "pass" | "maybe";
export interface ReviewDecision {
	key: string;
	name: string;
	kind: ReviewDecisionKind;
	/** Time spent on this card before deciding. */
	seconds: number;
}
const PACE_CAP_SECONDS = 90;
export interface ReviewTally {
	intro: number;
	pass: number;
	maybe: number;
	total: number;
	seconds: number;
	avgSeconds: number | null;
}

export type ReviewPanelState = { mode: "pass" | "intro"; item: ReviewItem; roleIdOverride?: string };

const EMPTY_BY_ROLE: ReviewListData["byRole"] = {};
const EMPTY_PAUSED_PENDING: ReviewListData["pausedPending"] = {};

const firstNameOf = (item: ReviewItem) => item.talentName.split(" ")[0] || item.talentName;
const reasonLabel = (categories: { id: string; label: string }[], args: { category?: string; text?: string }) =>
	args.text?.trim() || categories.find((c) => c.id === args.category)?.label;
/** "Passed · Aiko · Not enough experience": the parts that exist, dot-separated. */
const toastLine = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" · ");

interface HeldIntro {
	item: ReviewItem;
	roleIdOverride?: string;
	category: string | null;
	text: string | null;
	similarAnchorTalentId?: string;
}

export function useReviewBoard(
	orgId: string,
	roleId?: string,
	initialTalentId?: string,
	initialStreams?: ReviewStream[],
	sendoutTalentIds?: readonly string[],
	showMaybe = false,
) {
	const { data, isLoading, isPlaceholderData, isError, errorUpdatedAt, refetch } = useReviewItems(orgId, roleId);
	// A background retry resets a never-loaded list to "pending"; once it has failed, keep showing the error.
	const everFailed = errorUpdatedAt > 0;

	const initialSelectedKey = initialTalentId
		? reviewItemKey({ talentId: initialTalentId, roleId: roleId ?? null })
		: null;
	const [selectedKey, setSelectedKey] = useState<string | null>(initialSelectedKey);
	const [panel, setPanel] = useState<ReviewPanelState | null>(null);
	const [rolePicker, setRolePicker] = useState<{ item: ReviewItem; action: "request_intro" | "pass" } | null>(null);
	const [hmWarning, setHmWarning] = useState<{
		item: ReviewItem;
		roleIdChoice?: string;
		reason: "no_hm" | "hm_no_link";
		hmName?: string;
		hmContactId?: string;
	} | null>(null);
	const { readinessFor } = useRoleIntroReadiness(orgId);
	const [streams, setStreams] = useState<ReviewStream[]>(initialStreams ?? [...REVIEW_STREAMS]);
	// This visit's decisions, for the scoreboard and the recap; reset when the filter changes.
	const [decisions, setDecisions] = useState<ReviewDecision[]>([]);
	const lastDecisionAt = useRef(0);
	// Which way the deck card leaves: the last decision taken.
	const [lastMove, setLastMove] = useState<"pass" | "intro" | "maybe" | null>(null);
	const [maybeItem, setMaybeItem] = useState<ReviewItem | null>(null);
	const rolePickerItem = rolePicker?.item ?? null;

	const countDecision = useCallback((item: ReviewItem, kind: ReviewDecisionKind) => {
		const now = Date.now();
		// Time on this card, capped so a coffee break doesn't wreck the pace.
		const seconds = Math.min(PACE_CAP_SECONDS, Math.max(1, (now - (lastDecisionAt.current || now)) / 1000));
		lastDecisionAt.current = now;
		const key = reviewItemKey(item);
		setDecisions((prev) => [...prev.filter((d) => d.key !== key), { key, name: firstNameOf(item), kind, seconds }]);
	}, []);
	const uncountDecision = useCallback((key: string) => setDecisions((prev) => prev.filter((d) => d.key !== key)), []);

	const reversePass = useReverseReviewPass(orgId, {
		onFailed: ({ item, action }) => countDecision(item, action ?? "pass"),
	});
	// Decision toasts: 5s with a countdown bar; Undo (or Z) reverses the latest one.
	const undoRef = useRef<{ id: string; run: () => void } | null>(null);
	const undoToast = useCallback((id: string, message: string, undo: () => void) => {
		const run = () => {
			undoRef.current = null;
			toast.dismiss(id);
			undo();
		};
		const entry = { id, run };
		undoRef.current = entry;
		const forget = () => {
			if (undoRef.current === entry) undoRef.current = null;
		};
		toast.success(message, {
			id,
			duration: HELD_ACTION_WINDOW_MS,
			className: "toast-timer",
			style: { "--toast-ms": `${HELD_ACTION_WINDOW_MS}ms` } as CSSProperties,
			action: { label: "Undo", onClick: run },
			onAutoClose: forget,
			onDismiss: forget,
		});
	}, []);
	const undoLast = useCallback(() => undoRef.current?.run(), []);
	const { data: roles } = useRolesList(orgId, false);

	// Who the reviewer was on when a save failed: the failed person comes back right after them.
	const selectedKeyRef = useRef<string | null>(null);
	const retryAnchors = useRef(new Map<string, string | null>());
	const { mutation, isPending, isFailed, retry, failed } = useReviewAction(orgId, roleId, {
		onFailed: ({ item, action }) => {
			retryAnchors.current.set(reviewItemKey(item), selectedKeyRef.current);
			// Nothing left to undo for a decision that didn't save; its toast became the error.
			if (undoRef.current?.id === `review-action:${reviewItemKey(item)}`) undoRef.current = null;
			uncountDecision(reviewItemKey(item));
		},
	});
	const { mutate } = mutation;

	const {
		held,
		hold,
		flush: flushHeldIntro,
		cancel: cancelHeldIntro,
	} = useHeldAction<HeldIntro>(
		useCallback(
			(payload: HeldIntro) => {
				toast.dismiss(`held-intro:${reviewItemKey(payload.item)}`);
				mutate({
					item: payload.item,
					action: "request_intro",
					roleIdOverride: payload.roleIdOverride,
					interestCompanyReason: payload.text?.trim() || undefined,
					interestCompanyCategory: payload.category ?? undefined,
					similarAnchorTalentId: payload.similarAnchorTalentId,
				});
			},
			[mutate],
		),
	);

	const filterKey = `${roleId ?? ""}::${[...streams].sort().join(",")}`;
	const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
	if (filterKey !== prevFilterKey) {
		setPrevFilterKey(filterKey);
		setDecisions([]);
	}
	// The first card's time counts from when this filter opened.
	useEffect(() => {
		lastDecisionAt.current = Date.now();
	}, [filterKey]);

	const { similarTo, start: pullSimilar, drop: dropSimilar, isDesktop } = useSimilarFollowThrough(orgId);
	const heldKey = held ? reviewItemKey(held.item) : null;
	const sendoutScope = useMemo(() => (sendoutTalentIds ? new Set(sendoutTalentIds) : null), [sendoutTalentIds]);
	const feed = useMemo(() => {
		const all = data?.items ?? [];
		return sendoutScope ? all.filter((item) => sendoutScope.has(item.talentId)) : all;
	}, [data, sendoutScope]);
	const feedTalentIds = useMemo(() => new Set((data?.items ?? []).map((item) => item.talentId)), [data]);
	const items = useMemo(() => {
		const visible = sortByQueue(
			feed.filter(
				(i) => streams.includes(streamOf(i.bucket)) && reviewItemKey(i) !== heldKey && !!i.maybe === showMaybe,
			),
		);
		// Similar profiles pulled forward after an intro go first.
		// ponytail: they jump to the top, not to where the anchor sat; fine while reviewing top-down.
		const isPulled = (i: ReviewItem) => similarTo.has(reviewItemKey(i));
		const ordered =
			similarTo.size === 0 ? visible : [...visible.filter(isPulled), ...visible.filter((i) => !isPulled(i))];
		// A decision that didn't save comes back as the next card, not at its old spot behind the reviewer.
		const anchored = ordered.filter((i) => failed.has(reviewItemKey(i)));
		if (anchored.length === 0) return ordered;
		const result = ordered.filter((i) => !failed.has(reviewItemKey(i)));
		for (const i of anchored.reverse()) {
			const anchor = retryAnchors.current.get(reviewItemKey(i));
			result.splice(result.findIndex((r) => reviewItemKey(r) === anchor) + 1, 0, i);
		}
		return result;
	}, [feed, streams, heldKey, showMaybe, similarTo, failed]);
	const roleFeedCount = data?.items?.length ?? 0;
	const streamCounts = useMemo(() => {
		const acc: Record<ReviewStream, number> = { curated: 0, drop: 0, interest: 0 };
		for (const i of feed) acc[streamOf(i.bucket)]++;
		return { ...acc, all: feed.length };
	}, [feed]);
	const { chipsFor, onCardVisible } = useDeferredEntityChips(
		orgId,
		items.map((item) => item.talentId),
	);
	const onCardSeen = useTalentImpressions(
		orgId,
		"review",
		useMemo(() => ({ roleId, streams }), [roleId, streams]),
	);
	const selected = useMemo(
		() => items.find((i) => reviewItemKey(i) === selectedKey) ?? items[0] ?? null,
		[items, selectedKey],
	);
	useEffect(() => {
		selectedKeyRef.current = selected ? reviewItemKey(selected) : null;
	}, [selected]);
	useSimilarPicks(orgId, isDesktop ? (selected?.roleId ?? null) : null, selected?.talentId ?? null);

	const advance = useCallback(
		(acted: Pick<ReviewItem, "talentId" | "roleId">) => {
			const idx = items.findIndex((i) => reviewItemKey(i) === reviewItemKey(acted));
			const next = items[idx + 1] ?? (idx > 0 ? items[idx - 1] : null);
			setSelectedKey(next ? reviewItemKey(next) : null);
		},
		[items],
	);

	const undoHeldIntro = useCallback(
		(key: string) => {
			const cancelled = cancelHeldIntro((payload) => reviewItemKey(payload.item) === key);
			if (!cancelled) return;
			dropSimilar(key);
			setPanel(null);
			toast.dismiss(`held-intro:${key}`);
			setSelectedKey(key);
			uncountDecision(key);
		},
		[cancelHeldIntro, uncountDecision, dropSimilar],
	);

	const commitIntro = useCallback(
		(item: ReviewItem, args: { roleIdOverride?: string; category?: string; text?: string }) => {
			hold({
				item,
				roleIdOverride: args.roleIdOverride,
				category: args.category ?? null,
				text: args.text ?? null,
				similarAnchorTalentId: similarTo.get(reviewItemKey(item))?.anchor.talentId,
			});
			countDecision(item, "intro");
			setLastMove("intro");
			const pulled = pullSimilar(item, args.roleIdOverride);
			if (pulled.length > 0) setSelectedKey(pulled[0]);
			else advance(item);
			setPanel(null);
			const role = args.roleIdOverride && roles?.find((r) => r.id === args.roleIdOverride)?.position;
			undoToast(
				`held-intro:${reviewItemKey(item)}`,
				toastLine(
					"Intro requested",
					firstNameOf(item),
					reasonLabel(INTRO_DECISION_CATEGORIES, args),
					role,
					pulled.length > 0 && `${pulled.length} similar added`,
				),
				() => undoHeldIntro(reviewItemKey(item)),
			);
		},
		[hold, undoHeldIntro, countDecision, advance, pullSimilar, similarTo, roles, undoToast],
	);

	const openIntro = useCallback(
		(item: ReviewItem) => {
			if (!item.roleId) {
				setRolePicker({ item, action: "request_intro" });
				return;
			}
			const readiness = readinessFor(item.roleId);
			if (!readiness.ready && !isHmLinkWarningSuppressed()) {
				setHmWarning({
					item,
					reason: readiness.reason ?? "no_hm",
					hmName: readiness.hmName,
					hmContactId: readiness.hmContactId,
				});
				return;
			}
			flushHeldIntro();
			setPanel({ mode: "intro", item });
		},
		[readinessFor, flushHeldIntro],
	);

	const openPass = useCallback(
		(item: ReviewItem) => {
			flushHeldIntro();
			if (item.roleId) setPanel({ mode: "pass", item });
			else setRolePicker({ item, action: "pass" });
		},
		[flushHeldIntro],
	);

	const confirmIntro = useCallback(
		(args: { category?: string; text?: string }) => {
			if (panel?.mode !== "intro") return;
			commitIntro(panel.item, {
				roleIdOverride: panel.roleIdOverride,
				category: args.category,
				text: args.text,
			});
		},
		[panel, commitIntro],
	);

	const confirmRolePicker = useCallback(
		(roleIdChoice: string) => {
			if (!rolePicker) return;
			if (rolePicker.action === "pass") {
				setPanel({ mode: "pass", item: rolePicker.item, roleIdOverride: roleIdChoice });
				setRolePicker(null);
				return;
			}
			const readiness = readinessFor(roleIdChoice);
			if (!readiness.ready && !isHmLinkWarningSuppressed()) {
				setRolePicker(null);
				setHmWarning({
					item: rolePicker.item,
					roleIdChoice,
					reason: readiness.reason ?? "no_hm",
					hmName: readiness.hmName,
					hmContactId: readiness.hmContactId,
				});
				return;
			}
			setPanel({ mode: "intro", item: rolePicker.item, roleIdOverride: roleIdChoice });
			setRolePicker(null);
		},
		[rolePicker, readinessFor],
	);

	const continueFromHmWarning = useCallback(() => {
		if (!hmWarning) return;
		const { item, roleIdChoice } = hmWarning;
		setHmWarning(null);
		setPanel({ mode: "intro", item, roleIdOverride: roleIdChoice });
	}, [hmWarning]);

	const confirmPass = useCallback(
		(args: { category?: string; categories?: string[]; text?: string }) => {
			if (panel?.mode !== "pass") return;
			const { item, roleIdOverride } = panel;
			const categories = args.categories ?? (args.category ? [args.category] : undefined);
			mutate({
				item,
				action: "pass",
				noFitCategory: categories?.[0] ?? args.category,
				noFitCategories: categories && categories.length > 0 ? categories : undefined,
				rejectReason: args.text?.trim() || undefined,
				roleIdOverride,
				similarAnchorTalentId: similarTo.get(reviewItemKey(item))?.anchor.talentId,
			});
			countDecision(item, "pass");
			setLastMove("pass");
			advance(item);
			setPanel(null);
			undoToast(
				`review-action:${reviewItemKey(item)}`,
				toastLine("Passed", firstNameOf(item), reasonLabel(PASS_DECISION_CATEGORIES, args)),
				() => {
					reversePass.mutate({ item, opportunityId: item.opportunityId });
					setSelectedKey(reviewItemKey(item));
					uncountDecision(reviewItemKey(item));
				},
			);
		},
		[panel, mutate, advance, countDecision, similarTo, undoToast, reversePass, uncountDecision],
	);

	const dismissPanel = useCallback(() => setPanel(null), []);

	const openMaybe = useCallback(
		(item: ReviewItem) => {
			flushHeldIntro();
			setPanel(null);
			setMaybeItem(item);
		},
		[flushHeldIntro],
	);

	// Maybe parks the person (still pending) in the Maybe tab, with an optional note.
	const confirmMaybe = useCallback(
		(note: string) => {
			if (!maybeItem) return;
			const item = maybeItem;
			const key = reviewItemKey(item);
			mutate({ item, action: "maybe", maybeNote: note || undefined });
			setMaybeItem(null);
			countDecision(item, "maybe");
			setLastMove("maybe");
			advance(item);
			undoToast(`review-action:${key}`, `Moved ${firstNameOf(item)} to Maybe`, () => {
				reversePass.mutate({ item, opportunityId: item.opportunityId, action: "maybe" });
				setSelectedKey(key);
				uncountDecision(key);
			});
		},
		[maybeItem, mutate, advance, reversePass, undoToast, countDecision, uncountDecision],
	);

	// From the reason step back to "Which role?" (only for people who came without a role).
	const backToRole = useCallback(() => {
		if (!panel || panel.item.roleId) return;
		setRolePicker({ item: panel.item, action: panel.mode === "pass" ? "pass" : "request_intro" });
		setPanel(null);
	}, [panel]);

	const selectItem = useCallback(
		(item: ReviewItem) => {
			setLastMove(null);
			setSelectedKey(reviewItemKey(item));
			orgTalents.recordTalentView(orgId, { talentId: item.talentId, source: "review" }).catch(() => {});
		},
		[orgId],
	);

	const tally = useMemo<ReviewTally>(() => {
		const acc = { intro: 0, pass: 0, maybe: 0, total: decisions.length, seconds: 0 };
		for (const d of decisions) {
			acc[d.kind]++;
			acc.seconds += d.seconds;
		}
		return { ...acc, avgSeconds: acc.total > 0 ? Math.round(acc.seconds / acc.total) : null };
	}, [decisions]);

	const selectPrev = useCallback(() => {
		const idx = selected ? items.findIndex((i) => reviewItemKey(i) === reviewItemKey(selected)) : -1;
		const prev = items[idx - 1];
		if (prev) selectItem(prev);
	}, [items, selected, selectItem]);

	const selectNext = useCallback(() => {
		const idx = selected ? items.findIndex((i) => reviewItemKey(i) === reviewItemKey(selected)) : -1;
		const next = items[idx + 1];
		if (next) selectItem(next);
	}, [items, selected, selectItem]);

	return {
		undoLast,
		items,
		truncated: data?.truncated ?? false,
		isLoading: isLoading && !everFailed,
		loadFailed: (isError || everFailed) && (!data || isPlaceholderData),
		retryLoad: refetch,
		isSwitching: isPlaceholderData,
		chipsFor,
		onCardVisible,
		onCardSeen,
		selected,
		selectedKey: selected ? reviewItemKey(selected) : null,
		lastMove,
		isPending,
		isFailed,
		retry,
		selectItem,
		panel,
		similarTo,
		rolePickerItem,
		rolePickerAction: rolePicker?.action,
		hmWarningRoleId: hmWarning ? (hmWarning.roleIdChoice ?? hmWarning.item.roleId) : null,
		hmWarningReason: hmWarning?.reason ?? null,
		hmWarningHmName: hmWarning?.hmName ?? null,
		hmWarningHmContactId: hmWarning?.hmContactId ?? null,
		hmWarningOpen: !!hmWarning,
		openIntro,
		openPass,
		closeRolePicker: () => setRolePicker(null),
		closeHmWarning: () => setHmWarning(null),
		continueFromHmWarning,
		confirmRolePicker,
		confirmPass,
		confirmIntro,
		dismissPanel,
		backToRole,
		maybeItem,
		openMaybe,
		confirmMaybe,
		closeMaybe: () => setMaybeItem(null),
		selectPrev,
		selectNext,
		byRole: data?.byRole ?? EMPTY_BY_ROLE,
		pausedPending: data?.pausedPending ?? EMPTY_PAUSED_PENDING,
		feedTalentIds,
		streams,
		setStreams,
		streamCounts,
		roleFeedCount,
		decisions,
		tally,
		uncountDecision,
	};
}
