"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orgDashboardKeys } from "@/lib/query-keys";
import { organizations } from "@/services/api";
import { type ReviewItem, reviewItemKey } from "../types";
import { insertIntoReviewFeed, setMaybeInReviewFeed } from "./feed-cache";
import { invalidateOrgDashboard } from "./invalidate-org-dashboard";
import { REVIEW_DECISION_KEY } from "./use-review-action";

interface ReverseReviewPassInput {
	item: ReviewItem;
	opportunityId: number;
	/** What is being undone; the server just clears the decision. */
	action?: "pass" | "maybe";
}

interface ReverseReviewPassCallbacks {
	onFailed?: (input: ReverseReviewPassInput) => void;
}

export function useReverseReviewPass(orgId: string, roleId?: string, callbacks?: ReverseReviewPassCallbacks) {
	const queryClient = useQueryClient();
	const queryKey = orgDashboardKeys.review(orgId, roleId);

	return useMutation({
		mutationFn: async ({ item, opportunityId, action = "pass" }: ReverseReviewPassInput) => {
			// Undo right after deciding: let that decision land first, or there's nothing yet to undo.
			const deciding = () =>
				queryClient
					.getMutationCache()
					.findAll({ mutationKey: REVIEW_DECISION_KEY, status: "pending" })
					.some((m) => {
						const decided = (m.state.variables as { item?: ReviewItem } | undefined)?.item;
						return !!decided && reviewItemKey(decided) === reviewItemKey(item);
					});
			// ponytail: polls every 100ms for up to 5s; subscribe to the mutation cache if this ever matters.
			for (let i = 0; i < 50 && deciding(); i++) await new Promise((r) => setTimeout(r, 100));
			const result = await organizations.reverseDashboardAction(orgId, { opportunityId, action });
			if (!result.ok) throw new Error(result.error.message);
			return result.data;
		},
		onMutate: async ({ item, action }) => {
			await queryClient.cancelQueries({ queryKey });
			const previous =
				action === "maybe"
					? setMaybeInReviewFeed(queryClient, queryKey, item, null)
					: insertIntoReviewFeed(queryClient, queryKey, item);
			return { previous };
		},
		onError: (error, variables, context) => {
			if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
			callbacks?.onFailed?.(variables);
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
