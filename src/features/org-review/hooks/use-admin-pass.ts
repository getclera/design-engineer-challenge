"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orgDashboardKeys } from "@/lib/query-keys";
import { organizations } from "@/services/api";
import type { ReviewItem } from "../types";
import { removeFromReviewFeed } from "./feed-cache";
import { invalidateOrgDashboard } from "./invalidate-org-dashboard";

export function useAdminPass(orgId: string, roleId?: string) {
	const queryClient = useQueryClient();
	const reviewKey = orgDashboardKeys.review(orgId, roleId);
	const passedKey = orgDashboardKeys.passed(orgId, roleId);

	return useMutation({
		mutationFn: async (item: ReviewItem) => {
			if (!item.roleId) throw new Error("missing_role");
			const result = await organizations.adminPassCandidate(orgId, {
				talentId: item.talentId,
				jobId: item.roleId,
			});
			if (!result.ok) throw new Error(result.error.message);
			return result.data;
		},
		onMutate: async (item) => {
			await queryClient.cancelQueries({ queryKey: reviewKey });
			await queryClient.cancelQueries({ queryKey: passedKey });
			const previousFeed = removeFromReviewFeed(queryClient, reviewKey, item);
			const previousPassed = queryClient.getQueryData<{ items: ReviewItem[]; totalCount: number }>(passedKey);
			if (previousPassed) {
				const items = previousPassed.items.filter(
					(i) => !(i.talentId === item.talentId && i.opportunityId === item.opportunityId),
				);
				queryClient.setQueryData(passedKey, {
					items,
					totalCount: Math.max(0, previousPassed.totalCount - (previousPassed.items.length - items.length)),
				});
			}
			return { previousFeed, previousPassed };
		},
		onSuccess: () => toast.success("Candidate removed from this dashboard"),
		onError: (_e, _item, context) => {
			if (context?.previousFeed) queryClient.setQueryData(reviewKey, context.previousFeed);
			if (context?.previousPassed) queryClient.setQueryData(passedKey, context.previousPassed);
			toast.error("Something went wrong");
		},
		onSettled: () => invalidateOrgDashboard(queryClient),
	});
}
