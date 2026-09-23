"use client";

import { OrgDashboardEvents } from "@clera/posthog-events";
import { useQueryClient } from "@tanstack/react-query";
import { useMediaQuery } from "@v2/hooks/use-media-query";
import { usePostHog } from "posthog-js/react/slim";
import { useCallback, useState } from "react";
import { orgTalents } from "@/services/api/org-talents";
import type { ReviewItem, SimilarPick } from "../types";
import { similarPicksKey, useSimilarPicks } from "./use-similar-picks";

export interface SimilarFollowThrough {
	anchor: ReviewItem;
	roleId: string;
	picks: SimilarPick[];
}

export function useSimilarFollowThrough(orgId: string, selected: ReviewItem | null) {
	const queryClient = useQueryClient();
	const posthog = usePostHog();
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const [followThrough, setFollowThrough] = useState<SimilarFollowThrough | null>(null);
	useSimilarPicks(orgId, isDesktop ? (selected?.roleId ?? null) : null, selected?.talentId ?? null);

	const start = useCallback(
		(anchor: ReviewItem, roleIdOverride?: string) => {
			const roleId = roleIdOverride ?? anchor.roleId;
			if (!isDesktop || !roleId) return;
			const cached = queryClient.getQueryData<{ picks: SimilarPick[] }>(
				similarPicksKey(orgId, roleId, anchor.talentId),
			);
			const picks = cached?.picks ?? [];
			if (picks.length === 0) return;
			setFollowThrough({ anchor, roleId, picks });
			posthog?.capture(OrgDashboardEvents.SIMILAR_PICKS_SHOWN, {
				org_id: orgId,
				role_id: roleId,
				talent_id: anchor.talentId,
				pick_count: picks.length,
			});
			orgTalents
				.recordTalentImpressions(orgId, { talentIds: picks.map((pick) => pick.talentId), source: "review_similar" })
				.catch(() => {});
		},
		[isDesktop, queryClient, orgId, posthog],
	);

	const clear = useCallback(() => setFollowThrough(null), []);

	return { followThrough, start, clear };
}
