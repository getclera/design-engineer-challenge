"use client";

import { OrgDashboardEvents } from "@clera/posthog-events";
import { TALENT_NOT_OPEN_ERROR } from "@clera/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePostHog } from "posthog-js/react/slim";
import { useState } from "react";
import { toast } from "sonner";
import { orgDashboardKeys } from "@/lib/query-keys";
import { organizations } from "@/services/api";
import { type ReviewItem, reviewItemKey } from "../types";
import { removeFromReviewFeed } from "./feed-cache";
import { invalidateOrgDashboard } from "./invalidate-org-dashboard";

interface ReviewActionPayload {
	item: ReviewItem;
	action: "request_intro" | "pass";
	rejectReason?: string;
	noFitCategory?: string;
	noFitCategories?: string[];
	interestCompanyReason?: string;
	interestCompanyCategory?: string;
	roleIdOverride?: string;
}

export interface ReviewPassedToast {
	toastId: string;
	item: ReviewItem;
	opportunityId: number;
}

interface ReviewActionCallbacks {
	onPassed?: (args: ReviewPassedToast) => void;
	onFailed?: () => void;
}

export function useReviewAction(orgId: string, roleId?: string, callbacks?: ReviewActionCallbacks) {
	const queryClient = useQueryClient();
	const posthog = usePostHog();
	const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
	const queryKey = orgDashboardKeys.review(orgId, roleId);

	const mutation = useMutation({
		mutationFn: async ({
			item,
			action,
			rejectReason,
			noFitCategory,
			noFitCategories,
			interestCompanyReason,
			interestCompanyCategory,
			roleIdOverride,
		}: ReviewActionPayload) => {
			const jobId = roleIdOverride ?? item.roleId;
			if (!jobId) throw new Error("missing_role");
			const result = await organizations.performDashboardActionByTalentJob(orgId, {
				talentId: item.talentId,
				jobId,
				action,
				rejectReason,
				noFitCategory,
				noFitCategories,
				interestCompanyReason,
				interestCompanyCategory,
			});
			if (!result.ok) throw new Error(result.error.message);
			return result.data;
		},
		onMutate: async ({ item, action }) => {
			setPendingKeys((prev) => new Set(prev).add(reviewItemKey(item)));
			await queryClient.cancelQueries({ queryKey });
			const previous = removeFromReviewFeed(queryClient, queryKey, item);
			const toastId = `review-action:${reviewItemKey(item)}`;
			if (action !== "request_intro") callbacks?.onPassed?.({ toastId, item, opportunityId: item.opportunityId });
			return { previous, toastId };
		},
		onSuccess: (_data, { item, action }) => {
			posthog?.capture(
				action === "request_intro"
					? OrgDashboardEvents.CANDIDATE_ACTION_INTRO_REQUESTED
					: OrgDashboardEvents.CANDIDATE_ACTION_PASSED,
				{ org_id: orgId, role_id: item.roleId, talent_id: item.talentId, surface: "review" },
			);
		},
		onError: (error, _variables, context) => {
			if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
			callbacks?.onFailed?.();
			const notOpen = error instanceof Error && error.message.includes(TALENT_NOT_OPEN_ERROR);
			toast.error(notOpen ? "This candidate is not currently open to opportunities." : "Something went wrong", {
				id: context?.toastId,
			});
		},
		onSettled: (_data, _error, { item }) => {
			setPendingKeys((prev) => {
				const next = new Set(prev);
				next.delete(reviewItemKey(item));
				return next;
			});
			invalidateOrgDashboard(queryClient);
		},
	});

	const isPending = (item: Pick<ReviewItem, "talentId" | "roleId">) => pendingKeys.has(reviewItemKey(item));
	return { mutation, isPending };
}
