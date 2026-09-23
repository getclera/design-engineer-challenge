import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { talentKeys } from "@/lib/query-keys";
import { type ResumeListItem, resumes } from "@/services/api/resumes";
import logger from "@/utils/logger";

interface UseMultipleResumesResult {
	resumes: ResumeListItem[];
	selectedResumeId: string | null;
	primaryResumeId: string | null;
	isLoading: boolean;
	isError: boolean;
	error: string | null;
	hasMultipleResumes: boolean;
	selectResume: (resumeId: string) => void;
	setPrimary: (resumeId: string) => Promise<{ success: boolean; error?: string }>;
	deleteResume: (resumeId: string) => Promise<{ success: boolean; error?: string }>;
	isSettingPrimary: boolean;
	isDeleting: boolean;
	refetch: () => Promise<void>;
}

export function useMultipleResumes(
	candidateId: string | undefined,
	initialResumeId?: string,
): UseMultipleResumesResult {
	const queryClient = useQueryClient();
	const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

	const queryKey = candidateId ? talentKeys.resumeList(candidateId) : (["talent", "cv-list", "disabled"] as const);

	// biome-ignore lint/correctness/useExhaustiveDependencies: candidateId is a parameter that triggers reset
	useEffect(() => {
		setSelectedResumeId(null);
	}, [candidateId]);

	const {
		data,
		isLoading,
		isError,
		error,
		refetch: queryRefetch,
	} = useQuery({
		queryKey,
		queryFn: async () => {
			if (!candidateId) throw new Error("Candidate ID is required");
			logger.info("Fetching resume list for candidate", { candidateId });
			const result = await resumes.getAll(candidateId);
			if (!result.ok) {
				throw new Error(result.error?.message || "Failed to fetch resume list");
			}
			return result.data;
		},
		enabled: !!candidateId,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});

	const resumeList = data?.resumes ?? [];
	const primaryResume = resumeList.find((c) => c.is_primary);
	const primaryResumeId = primaryResume?.id ?? resumeList[0]?.id ?? null;

	const existsInList = (resumeId: string | null | undefined) =>
		resumeId && resumeList.some((c) => c.id === resumeId) ? resumeId : null;
	const effectiveSelectedResumeId = existsInList(selectedResumeId) ?? existsInList(initialResumeId) ?? primaryResumeId;

	const setPrimaryMutation = useMutation({
		mutationFn: async (resumeId: string) => {
			if (!candidateId) throw new Error("Candidate ID is required");
			const result = await resumes.setPrimary(candidateId, resumeId);
			if (!result.ok) {
				throw new Error(result.error?.message || "Failed to set primary resume");
			}
			return result.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			queryClient.invalidateQueries({ queryKey: talentKeys.resumeData(candidateId ?? "") });
			queryClient.invalidateQueries({ queryKey: talentKeys.primaryResume(candidateId ?? "") });
		},
		onError: (error) => {
			logger.error("Failed to set primary resume", { error });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (resumeId: string) => {
			if (!candidateId) throw new Error("Candidate ID is required");
			const result = await resumes.remove(candidateId, resumeId);
			if (!result.ok) {
				throw new Error(result.error?.message || "Failed to delete resume");
			}
			return result.data;
		},
		onSuccess: (_, deletedResumeId) => {
			if (selectedResumeId === deletedResumeId) {
				setSelectedResumeId(null);
			}
		},
		onError: (error) => {
			logger.error("Failed to delete resume", { error });
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey });
			queryClient.invalidateQueries({ queryKey: talentKeys.resumeData(candidateId ?? "") });
			queryClient.invalidateQueries({ queryKey: talentKeys.primaryResume(candidateId ?? "") });
		},
	});

	const selectResume = useCallback((resumeId: string) => {
		setSelectedResumeId(resumeId);
	}, []);

	const setPrimaryHandler = async (resumeId: string): Promise<{ success: boolean; error?: string }> => {
		try {
			await setPrimaryMutation.mutateAsync(resumeId);
			return { success: true };
		} catch (err) {
			return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
		}
	};

	const deleteResumeHandler = async (resumeId: string): Promise<{ success: boolean; error?: string }> => {
		try {
			await deleteMutation.mutateAsync(resumeId);
			return { success: true };
		} catch (err) {
			return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
		}
	};

	const refetch = useCallback(async () => {
		await queryRefetch();
	}, [queryRefetch]);

	const errorMessage = isError ? (error instanceof Error ? error.message : "An unexpected error occurred") : null;

	return {
		resumes: resumeList,
		selectedResumeId: effectiveSelectedResumeId,
		primaryResumeId,
		isLoading,
		isError,
		error: errorMessage,
		hasMultipleResumes: resumeList.length > 1,
		selectResume,
		setPrimary: setPrimaryHandler,
		deleteResume: deleteResumeHandler,
		isSettingPrimary: setPrimaryMutation.isPending,
		isDeleting: deleteMutation.isPending,
		refetch,
	};
}
