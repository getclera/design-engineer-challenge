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
import { insertIntoReviewFeed, removeFromReviewFeed, setMaybeInReviewFeed } from "./feed-cache";
import { invalidateOrgDashboard } from "./invalidate-org-dashboard";

interface ReviewActionPayload {
	item: ReviewItem;
	action: "request_intro" | "pass" | "maybe";
	maybeNote?: string;
	rejectReason?: string;
	noFitCategory?: string;
	noFitCategories?: string[];
	interestCompanyReason?: string;
	interestCompanyCategory?: string;
	roleIdOverride?: string;
	/** Set when deciding on a similar profile pulled forward after this talent's intro. */
	similarAnchorTalentId?: string;
}

interface ReviewActionCallbacks {
	onFailed?: (payload: ReviewActionPayload) => void;
}

const firstNameOf = (item: ReviewItem) => item.talentName.split(" ")[0] || item.talentName;
const FAILED_MESSAGE: Record<ReviewActionPayload["action"], (name: string) => string> = {
	pass: (name) => `Couldn't save Pass for ${name}`,
	request_intro: (name) => `Couldn't request intro for ${name}`,
	maybe: (name) => `Couldn't move ${name} to Maybe`,
};

export function useReviewAction(orgId: string, roleId?: string, callbacks?: ReviewActionCallbacks) {
	const queryClient = useQueryClient();
	const posthog = usePostHog();
	const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
	// Decisions the server refused, kept so the list can offer Retry with the exact same request.
	const [failed, setFailed] = useState<Map<string, ReviewActionPayload>>(new Map());
	const queryKey = orgDashboardKeys.review(orgId, roleId);

	const mutation = useMutation({
		mutationFn: async ({
			item,
			action,
			maybeNote,
			rejectReason,
			noFitCategory,
			noFitCategories,
			interestCompanyReason,
			interestCompanyCategory,
			roleIdOverride,
			similarAnchorTalentId,
		}: ReviewActionPayload) => {
			const jobId = roleIdOverride ?? item.roleId;
			if (!jobId) throw new Error("missing_role");
			const result = await organizations.performDashboardActionByTalentJob(orgId, {
				talentId: item.talentId,
				jobId,
				action,
				maybeNote,
				rejectReason,
				noFitCategory,
				noFitCategories,
				interestCompanyReason,
				interestCompanyCategory,
				origin: similarAnchorTalentId ? "similar_picks" : undefined,
				similarAnchorTalentId,
			});
			if (!result.ok) throw new Error(result.error.message);
			return result.data;
		},
		onMutate: async ({ item, action, maybeNote }) => {
			setPendingKeys((prev) => new Set(prev).add(reviewItemKey(item)));
			setFailed((prev) => {
				if (!prev.has(reviewItemKey(item))) return prev;
				const next = new Map(prev);
				next.delete(reviewItemKey(item));
				return next;
			});
			await queryClient.cancelQueries({ queryKey });
			if (action === "maybe") setMaybeInReviewFeed(queryClient, queryKey, item, { note: maybeNote ?? "" });
			else removeFromReviewFeed(queryClient, queryKey, item);
			return { toastId: `review-action:${reviewItemKey(item)}` };
		},
		onSuccess: (_data, { item, action, similarAnchorTalentId }) => {
			if (action === "maybe") return;
			const intro = action === "request_intro";
			posthog?.capture(
				similarAnchorTalentId
					? intro
						? OrgDashboardEvents.SIMILAR_PICK_INTRO_REQUESTED
						: OrgDashboardEvents.SIMILAR_PICK_PASSED
					: intro
						? OrgDashboardEvents.CANDIDATE_ACTION_INTRO_REQUESTED
						: OrgDashboardEvents.CANDIDATE_ACTION_PASSED,
				{
					org_id: orgId,
					role_id: item.roleId,
					talent_id: item.talentId,
					surface: "review",
					anchor_talent_id: similarAnchorTalentId,
				},
			);
		},
		onError: (error, variables, context) => {
			if (variables.action === "maybe") setMaybeInReviewFeed(queryClient, queryKey, variables.item, null);
			else insertIntoReviewFeed(queryClient, queryKey, variables.item);
			callbacks?.onFailed?.(variables);
			setFailed((prev) => new Map(prev).set(reviewItemKey(variables.item), variables));
			const notOpen = error instanceof Error && error.message.includes(TALENT_NOT_OPEN_ERROR);
			const message = notOpen
				? "This candidate is not currently open to opportunities."
				: FAILED_MESSAGE[variables.action](firstNameOf(variables.item));
			toast.error(message, {
				id: context?.toastId,
				action: notOpen ? undefined : { label: "Retry", onClick: () => mutation.mutate(variables) },
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
	const isFailed = (item: Pick<ReviewItem, "talentId" | "roleId">) => failed.has(reviewItemKey(item));
	const retry = (item: Pick<ReviewItem, "talentId" | "roleId">) => {
		const payload = failed.get(reviewItemKey(item));
		if (payload) mutation.mutate(payload);
	};
	return { mutation, isPending, isFailed, retry, failed };
}
