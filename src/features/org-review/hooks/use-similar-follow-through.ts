"use client";

import { OrgDashboardEvents } from "@clera/posthog-events";
import { useQueryClient } from "@tanstack/react-query";
import { useMediaQuery } from "@v2/hooks/use-media-query";
import { usePostHog } from "posthog-js/react/slim";
import { useCallback, useState } from "react";
import { orgTalents } from "@/services/api/org-talents";
import { type ReviewItem, reviewItemKey, type SimilarPick } from "../types";
import { similarPicksKey } from "./use-similar-picks";

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

	/** Pulls the anchor's similar profiles forward; returns their keys (empty when there are none). */
	const start = useCallback(
		(anchor: ReviewItem, roleIdOverride?: string): string[] => {
			const roleId = roleIdOverride ?? anchor.roleId;
			if (!isDesktop || !roleId) return [];
			const cached = queryClient.getQueryData<{ picks: SimilarPick[] }>(
				similarPicksKey(orgId, roleId, anchor.talentId),
			);
			const picks = cached?.picks ?? [];
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
		[isDesktop, queryClient, orgId, posthog],
	);

	/** Forget pulled-forward cards for an undone intro. */
	const drop = useCallback((anchorKey: string) => {
		setSimilarTo((prev) => new Map([...prev].filter(([, s]) => reviewItemKey(s.anchor) !== anchorKey)));
	}, []);

	return { similarTo, start, drop, isDesktop };
}
