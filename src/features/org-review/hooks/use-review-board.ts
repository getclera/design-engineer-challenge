"use client";

import { HELD_ACTION_WINDOW_MS, useHeldAction, useTalentImpressions } from "@v2/features/org-shared-cards";
import { useDeferredEntityChips } from "@v2/hooks/use-deferred-entity-chips";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { orgTalents } from "@/services/api/org-talents";
import { isHmLinkWarningSuppressed } from "../hm-warning-cookie";
import {
	REVIEW_STREAMS,
	type ReviewBucketCounts,
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

export type ReviewPanelState = { mode: "pass" | "intro"; item: ReviewItem; roleIdOverride?: string };

const EMPTY_BY_ROLE: ReviewListData["byRole"] = {};
const EMPTY_PAUSED_PENDING: ReviewListData["pausedPending"] = {};

interface HeldIntro {
	item: ReviewItem;
	roleIdOverride?: string;
	category: string | null;
	text: string | null;
}

export function useReviewBoard(
	orgId: string,
	roleId?: string,
	initialTalentId?: string,
	initialStreams?: ReviewStream[],
	sendoutTalentIds?: readonly string[],
) {
	const { data, isLoading, isPlaceholderData } = useReviewItems(orgId, roleId);

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
	const rolePickerItem = rolePicker?.item ?? null;

	const panelTextRef = useRef("");

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
	const { mutation, isPending } = useReviewAction(orgId, roleId, { onPassed, onFailed: uncountReviewed });
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

	const heldKey = held ? reviewItemKey(held.item) : null;
	const sendoutScope = useMemo(() => (sendoutTalentIds ? new Set(sendoutTalentIds) : null), [sendoutTalentIds]);
	const feed = useMemo(() => {
		const all = data?.items ?? [];
		return sendoutScope ? all.filter((item) => sendoutScope.has(item.talentId)) : all;
	}, [data, sendoutScope]);
	const feedTalentIds = useMemo(() => new Set((data?.items ?? []).map((item) => item.talentId)), [data]);
	const items = useMemo(
		() => feed.filter((i) => streams.includes(streamOf(i.bucket)) && reviewItemKey(i) !== heldKey),
		[feed, streams, heldKey],
	);
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
	const counts: ReviewBucketCounts = useMemo(
		() => data?.counts ?? { all: 0, intro_request: 0, role_specific: 0, weekly_drop: 0, public_drop: 0 },
		[data],
	);
	const selected = useMemo(
		() => items.find((i) => reviewItemKey(i) === selectedKey) ?? items[0] ?? null,
		[items, selectedKey],
	);
	const similar = useSimilarFollowThrough(orgId, selected);
	const { start: startFollowThrough, clear: clearFollowThrough } = similar;

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
			clearFollowThrough();
			setPanel(null);
			toast.dismiss(`held-intro:${key}`);
			setSelectedKey(key);
			uncountReviewed();
		},
		[cancelHeldIntro, uncountReviewed, clearFollowThrough],
	);

	const commitIntro = useCallback(
		(item: ReviewItem, args: { roleIdOverride?: string; category?: string; text?: string }) => {
			hold({
				item,
				roleIdOverride: args.roleIdOverride,
				category: args.category ?? null,
				text: args.text ?? null,
			});
			countReviewed();
			advance(item);
			startFollowThrough(item, args.roleIdOverride);
			setPanel(null);
			toast.success("Intro requested", {
				id: `held-intro:${reviewItemKey(item)}`,
				duration: HELD_ACTION_WINDOW_MS,
				action: { label: "Undo", onClick: () => undoHeldIntro(reviewItemKey(item)) },
			});
		},
		[hold, undoHeldIntro, countReviewed, advance, startFollowThrough],
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
			clearFollowThrough();
			panelTextRef.current = "";
			setPanel({ mode: "intro", item });
		},
		[readinessFor, flushHeldIntro, clearFollowThrough],
	);

	const openPass = useCallback(
		(item: ReviewItem) => {
			flushHeldIntro();
			clearFollowThrough();
			panelTextRef.current = "";
			if (item.roleId) setPanel({ mode: "pass", item });
			else setRolePicker({ item, action: "pass" });
		},
		[flushHeldIntro, clearFollowThrough],
	);

	const confirmIntro = useCallback(
		(args: { category?: string; text?: string }) => {
			if (panel?.mode !== "intro") return;
			commitIntro(panel.item, {
				roleIdOverride: panel.roleIdOverride,
				category: args.category,
				text: args.text ?? (panelTextRef.current.trim() || undefined),
			});
		},
		[panel, commitIntro],
	);

	const confirmRolePicker = useCallback(
		(roleIdChoice: string) => {
			if (!rolePicker) return;
			if (rolePicker.action === "pass") {
				panelTextRef.current = "";
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
			panelTextRef.current = "";
			setPanel({ mode: "intro", item: rolePicker.item, roleIdOverride: roleIdChoice });
			setRolePicker(null);
		},
		[rolePicker, readinessFor],
	);

	const continueFromHmWarning = useCallback(() => {
		if (!hmWarning) return;
		const { item, roleIdChoice } = hmWarning;
		setHmWarning(null);
		panelTextRef.current = "";
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
			});
			countReviewed();
			advance(item);
			setPanel(null);
		},
		[panel, mutate, advance, countReviewed],
	);

	const setPanelText = useCallback((text: string) => {
		panelTextRef.current = text;
	}, []);

	const dismissPanel = useCallback(() => setPanel(null), []);

	const selectItem = useCallback(
		(item: ReviewItem) => {
			clearFollowThrough();
			setSelectedKey(reviewItemKey(item));
			orgTalents.recordTalentView(orgId, { talentId: item.talentId, source: "review" }).catch(() => {});
		},
		[orgId, clearFollowThrough],
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
		isSwitching: isPlaceholderData,
		chipsFor,
		onCardVisible,
		onCardSeen,
		selected,
		selectedKey: selected ? reviewItemKey(selected) : null,
		isPending,
		selectItem,
		panel,
		followThrough: similar.followThrough,
		continueReviewing: clearFollowThrough,
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
		setPanelText,
		dismissPanel,
		flushHeldIntro,
		selectPrev,
		selectNext,
		counts,
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
