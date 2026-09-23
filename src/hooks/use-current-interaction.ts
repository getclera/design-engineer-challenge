"use client";

import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { talentKeys } from "@/lib/query-keys";
import { type CurrentUserInteractionResponse, talents, unwrap } from "@/services/api";

export type CurrentInteraction = CurrentUserInteractionResponse & { resumeUrl?: string };

const INTERACTION_QUERY_KEY = talentKeys.currentInteraction();

export function useCurrentInteraction(enabled = true) {
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery<CurrentInteraction | null>({
		queryKey: INTERACTION_QUERY_KEY,
		queryFn: async () => {
			const result = await talents.fetchCurrentUserInteraction();
			if (!result.ok) throw new Error(result.error.message);
			return result.data ?? null;
		},
		enabled,
		staleTime: 5 * 60 * 1000,
	});

	const setResumeUrl = useCallback(
		(url: string) => {
			queryClient.setQueryData<CurrentInteraction | null>(INTERACTION_QUERY_KEY, (prev) =>
				prev ? { ...prev, resumeUrl: url } : prev,
			);
		},
		[queryClient],
	);

	const updateOptimistically = useCallback(
		(updates: Partial<CurrentInteraction>) => {
			queryClient.setQueryData<CurrentInteraction | null>(INTERACTION_QUERY_KEY, (prev) =>
				prev ? { ...prev, ...updates } : prev,
			);
		},
		[queryClient],
	);

	const refetchAiData = useCallback(async () => {
		await queryClient.invalidateQueries({ queryKey: INTERACTION_QUERY_KEY });
	}, [queryClient]);

	return {
		currentUserInteraction: data ?? null,
		isLoading,
		refetchAiData,
		setResumeUrl,
		updateOptimistically,
	};
}

export function useSuspenseCurrentInteraction(): CurrentUserInteractionResponse | null {
	return useSuspenseQuery({
		queryKey: INTERACTION_QUERY_KEY,
		queryFn: () => talents.fetchCurrentUserInteraction().then(unwrap),
		staleTime: 5 * 60 * 1000,
	}).data;
}
