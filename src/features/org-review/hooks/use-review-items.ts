"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type ReviewListData, reviewFeedQueryOptions } from "@v2/lib/review-feed";

export function useReviewItems(orgId: string, roleId?: string) {
	return useQuery<ReviewListData>({
		...reviewFeedQueryOptions(orgId, roleId),
		staleTime: 10_000,
		placeholderData: keepPreviousData,
		enabled: !!orgId,
		// A failed load keeps retrying quietly, so the error screen can promise "we'll try again".
		refetchInterval: (query) => (query.state.status === "error" ? 8_000 : false),
	});
}
