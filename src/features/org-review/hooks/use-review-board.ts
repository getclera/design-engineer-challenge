"use client";

import { HELD_ACTION_WINDOW_MS, useHeldAction, useTalentImpressions } from "@v2/features/org-shared-cards";
import { useDeferredEntityChips } from "@v2/hooks/use-deferred-entity-chips";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { orgTalents } from "@/services/api/org-talents";
import { isHmLinkWarningSuppressed } from "../hm-warning-cookie";
import {
	REVIEW_STREAMS,
	type ReviewItem,
	type ReviewListData,
	type ReviewStream,
	reviewItemKey,
	streamOf,
} from "../types";
import { useReverseReviewPass } from "./use-reverse-review-pass";
import { type ReviewPassedToast, useReviewAction } from "./use-review-action";
import { useReviewItems } from "./use-review-items";
import { useRoleIntroReadiness } from "./use-role-intro-readiness";
import { useSimilarFollowThrough } from "./use-similar-follow-through";
import { useSimilarPicks } from "./use-similar-picks";

export type ReviewPanelState = { mode: "pass" | "intro"; item: ReviewItem; roleIdOverride?: string };

const EMPTY_BY_ROLE: ReviewListData["byRole"] = {};
const EMPTY_PAUSED_PENDING: ReviewListData["pausedPending"] = {};

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
	const { data, isLoading, isPlaceholderData, isError, refetch } = useReviewItems(orgId, roleId);

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
	const [reviewedCount, setReviewedCount] = useState(0);
	// Which way the deck card leaves: the last decision taken.
	const [lastMove, setLastMove] = useState<"pass" | "intro" | "maybe" | null>(null);
	const [maybeItem, setMaybeItem] = useState<ReviewItem | null>(null);
	const rolePickerItem = rolePicker?.item ?? null;

	const countReviewed = useCallback(() => setReviewedCount((c) => c + 1), []);
	const uncountReviewed = useCallback(() => setReviewedCount((c) => Math.max(0, c - 1)), []);

	const reversePass = useReverseReviewPass(orgId, { onFailed: countReviewed });
	const onPassed = useCallback(
		({ toastId, item, opportunityId }: ReviewPassedToast) => {
			toast.success(`Passed on ${item.talentName}`, {
				id: toastId,
				action: {
					label: "Undo",
					onClick: () => {
						reversePass.mutate({ item, opportunityId });
						setSelectedKey(reviewItemKey(item));
						uncountReviewed();
					},
				},
			});
		},
		[reversePass, uncountReviewed],
	);
	const { mutation, isPending, isFailed, retry } = useReviewAction(orgId, roleId, { onPassed, onFailed: uncountReviewed });
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
		setReviewedCount(0);
	}

	const { similarTo, start: pullSimilar, drop: dropSimilar, isDesktop } = useSimilarFollowThrough(orgId);
	const heldKey = held ? reviewItemKey(held.item) : null;
	const sendoutScope = useMemo(() => (sendoutTalentIds ? new Set(sendoutTalentIds) : null), [sendoutTalentIds]);
	const feed = useMemo(() => {
		const all = data?.items ?? [];
		return sendoutScope ? all.filter((item) => sendoutScope.has(item.talentId)) : all;
	}, [data, sendoutScope]);
	const feedTalentIds = useMemo(() => new Set((data?.items ?? []).map((item) => item.talentId)), [data]);
	const items = useMemo(() => {
		const visible = feed.filter(
			(i) => streams.includes(streamOf(i.bucket)) && reviewItemKey(i) !== heldKey && !!i.maybe === showMaybe,
		);
		// Similar profiles pulled forward after an intro go first.
		// ponytail: they jump to the top, not to where the anchor sat; fine while reviewing top-down.
		if (similarTo.size === 0) return visible;
		const isPulled = (i: ReviewItem) => similarTo.has(reviewItemKey(i));
		return [...visible.filter(isPulled), ...visible.filter((i) => !isPulled(i))];
	}, [feed, streams, heldKey, showMaybe, similarTo]);
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
			uncountReviewed();
		},
		[cancelHeldIntro, uncountReviewed, dropSimilar],
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
			countReviewed();
			setLastMove("intro");
			const pulled = pullSimilar(item, args.roleIdOverride);
			if (pulled.length > 0) setSelectedKey(pulled[0]);
			else advance(item);
			setPanel(null);
			toast.success("Intro requested", {
				id: `held-intro:${reviewItemKey(item)}`,
				duration: HELD_ACTION_WINDOW_MS,
				action: { label: "Undo", onClick: () => undoHeldIntro(reviewItemKey(item)) },
			});
		},
		[hold, undoHeldIntro, countReviewed, advance, pullSimilar, similarTo],
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
			countReviewed();
			setLastMove("pass");
			advance(item);
			setPanel(null);
		},
		[panel, mutate, advance, countReviewed, similarTo],
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
			setLastMove("maybe");
			advance(item);
			toast.success(`Moved ${item.talentName.split(" ")[0]} to Maybe`, {
				id: `review-action:${key}`,
				action: {
					label: "Undo",
					onClick: () => {
						reversePass.mutate({ item, opportunityId: item.opportunityId, action: "maybe" });
						setSelectedKey(key);
					},
				},
			});
		},
		[maybeItem, mutate, advance, reversePass],
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
		items,
		truncated: data?.truncated ?? false,
		isLoading,
		loadFailed: isError && (!data || isPlaceholderData),
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
		reviewedCount,
		uncountReviewed,
	};
}
