"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orgDashboardKeys } from "@/lib/query-keys";
import { organizations } from "@/services/api";
import type { ReviewItem } from "../types";
import { invalidateOrgDashboard } from "./invalidate-org-dashboard";

const PASSED_PAGE_SIZE = 50;

interface PassedItemsCallbacks {
	onUnpassed?: () => void;
}

export function usePassedItems(orgId: string, roleId?: string, callbacks?: PassedItemsCallbacks) {
	const queryClient = useQueryClient();
	const queryKey = orgDashboardKeys.passed(orgId, roleId);

	const query = useQuery<{ items: ReviewItem[]; totalCount: number }>({
		queryKey,
		queryFn: async () => {
			const result = await organizations.getPassedItems<ReviewItem>(orgId, {
				limit: PASSED_PAGE_SIZE,
				offset: 0,
				roleId,
			});
			if (!result.ok) throw new Error("Failed to load passed candidates");
			return { items: result.data.items, totalCount: result.data.totalCount };
		},
		staleTime: 30_000,
		enabled: !!orgId,
		placeholderData: keepPreviousData,
	});

	const unpass = useMutation({
		mutationFn: async (opportunityId: number) => {
			const result = await organizations.reverseDashboardAction(orgId, { opportunityId, action: "pass" });
			if (!result.ok) throw new Error(result.error.message);
			return result.data;
		},
		onMutate: async (opportunityId) => {
			await queryClient.cancelQueries({ queryKey });
			const previous = queryClient.getQueryData<{ items: ReviewItem[]; totalCount: number }>(queryKey);
			if (previous) {
				const items = previous.items.filter((i) => i.opportunityId !== opportunityId);
				queryClient.setQueryData(queryKey, { items, totalCount: Math.max(0, previous.totalCount - 1) });
			}
			callbacks?.onUnpassed?.();
			return { previous };
		},
		onSuccess: () => toast.success("Brought back to your review queue"),
		onError: (_e, _v, context) => {
			if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
			toast.error("Something went wrong");
		},
		onSettled: () => invalidateOrgDashboard(queryClient),
	});

	return { query, unpass };
}
