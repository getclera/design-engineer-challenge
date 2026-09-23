"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orgDashboardKeys } from "@/lib/query-keys";
import { organizations } from "@/services/api";
import type { ReviewItem } from "../types";
import { insertIntoReviewFeed } from "./feed-cache";
import { invalidateOrgDashboard } from "./invalidate-org-dashboard";

interface ReverseReviewPassInput {
	item: ReviewItem;
	opportunityId: number;
}

interface ReverseReviewPassCallbacks {
	onFailed?: () => void;
}

export function useReverseReviewPass(orgId: string, callbacks?: ReverseReviewPassCallbacks) {
	const queryClient = useQueryClient();
	const queryKey = orgDashboardKeys.review(orgId, undefined);

	return useMutation({
		mutationFn: async ({ opportunityId }: ReverseReviewPassInput) => {
			const result = await organizations.reverseDashboardAction(orgId, { opportunityId, action: "pass" });
			if (!result.ok) throw new Error(result.error.message);
			return result.data;
		},
		onMutate: async ({ item }) => {
			await queryClient.cancelQueries({ queryKey });
			const previous = insertIntoReviewFeed(queryClient, queryKey, item);
			return { previous };
		},
		onError: (error, _variables, context) => {
			if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
			callbacks?.onFailed?.();
			toast.error(
				error.message === "Opportunity is not a reversible pass"
					? "This pass can no longer be undone"
					: "Something went wrong",
			);
		},
		onSettled: () => {
			invalidateOrgDashboard(queryClient);
		},
	});
}
