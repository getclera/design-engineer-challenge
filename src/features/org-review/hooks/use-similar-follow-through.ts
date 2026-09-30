"use client";

import { OrgDashboardEvents } from "@clera/posthog-events";
import { useQueryClient } from "@tanstack/react-query";
import { useMediaQuery } from "@v2/hooks/use-media-query";
import { usePostHog } from "posthog-js/react/slim";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { orgDashboardKeys } from "@/lib/query-keys";
import type { ReviewListData } from "@v2/lib/review-feed";
import { orgTalents } from "@/services/api/org-talents";
import { type ReviewItem, reviewItemKey, type SimilarPick } from "../types";
import { similarPicksKey, similarPicksQuery } from "./use-similar-picks";

/** Why a card was pulled forward: it's similar to someone the hiring manager just asked to meet. */
export interface SimilarTo {
	anchor: ReviewItem;
	reason: string;
}

/**
 * After an intro, the anchor's similar profiles (already in this role's feed) are pulled to the
 * front of the deck, keyed by review item, so they're decided next through the normal path.
 */
export function useSimilarFollowThrough(orgId: string) {
	const queryClient = useQueryClient();
	const posthog = usePostHog();
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const [similarTo, setSimilarTo] = useState<ReadonlyMap<string, SimilarTo>>(new Map());
	// Intros still standing: picks that arrive after an undo are dropped.
	const liveAnchors = useRef(new Set<string>());

	const pull = useCallback(
		(anchor: ReviewItem, roleId: string, allPicks: SimilarPick[]): string[] => {
			// Only people still waiting in the list you have, so the count in the toast is what moves up.
			const waiting = new Set(
				queryClient
					.getQueriesData<ReviewListData>({ queryKey: orgDashboardKeys.review(orgId).slice(0, -1) })
					.flatMap(([, data]) => data?.items.filter((i) => !i.maybe).map(reviewItemKey) ?? []),
			);
			const picks = allPicks.filter((pick) => waiting.has(reviewItemKey({ talentId: pick.talentId, roleId })));
			if (picks.length === 0) return [];
			const keys = picks.map((pick) => reviewItemKey({ talentId: pick.talentId, roleId }));
			setSimilarTo((prev) => {
				const next = new Map(prev);
				picks.forEach((pick, i) => next.set(keys[i], { anchor, reason: pick.reason }));
				return next;
			});
			posthog?.capture(OrgDashboardEvents.SIMILAR_PICKS_SHOWN, {
				org_id: orgId,
				role_id: roleId,
				talent_id: anchor.talentId,
				pick_count: picks.length,
			});
			orgTalents
				.recordTalentImpressions(orgId, { talentIds: picks.map((pick) => pick.talentId), source: "review_similar" })
				.catch(() => {});
			return keys;
		},
		[orgId, posthog, queryClient],
	);

	/**
	 * Pulls the anchor's similar profiles forward; returns their keys (empty when there are none).
	 * On a slow network the picks may still be loading: they're pulled forward when they land.
	 */
	const start = useCallback(
		(anchor: ReviewItem, roleIdOverride?: string): string[] => {
			const roleId = roleIdOverride ?? anchor.roleId;
			if (!isDesktop || !roleId) return [];
			const anchorKey = reviewItemKey(anchor);
			liveAnchors.current.add(anchorKey);
			const cached = queryClient.getQueryData<{ picks: SimilarPick[] }>(
				similarPicksKey(orgId, roleId, anchor.talentId),
			);
			if (cached) return pull(anchor, roleId, cached.picks);
			queryClient
				.fetchQuery(similarPicksQuery(orgId, roleId, anchor.talentId))
				.then(({ picks }) => {
					if (!liveAnchors.current.has(anchorKey)) return;
					const keys = pull(anchor, roleId, picks);
					const name = anchor.talentName.split(" ")[0] || anchor.talentName;
					if (keys.length > 0) toast.success(`${keys.length} similar to ${name} added to the top`);
				})
				.catch(() => {});
			return [];
		},
		[isDesktop, queryClient, orgId, pull],
	);

	/** Forget pulled-forward cards for an undone intro. */
	const drop = useCallback((anchorKey: string) => {
		liveAnchors.current.delete(anchorKey);
		setSimilarTo((prev) => new Map([...prev].filter(([, s]) => reviewItemKey(s.anchor) !== anchorKey)));
	}, []);

	return { similarTo, start, drop, isDesktop };
}
