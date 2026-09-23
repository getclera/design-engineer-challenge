"use client";

import { useQuery } from "@tanstack/react-query";
import { type ReviewListData, reviewFeedQueryOptions } from "@v2/lib/review-feed";

export function useReviewQueueCounts(orgId: string, enabled = true) {
	return useQuery({
		...reviewFeedQueryOptions(orgId, undefined),
		select: (data: ReviewListData) => ({ byRole: data.byRole, pausedPending: data.pausedPending, counts: data.counts }),
		staleTime: 30_000,
		enabled: !!orgId && enabled,
	});
}
