import { useQuery } from "@tanstack/react-query";
import { talentKeys } from "@/lib/query-keys";
import logger from "@/utils/logger";
import { getResumeData, type ResumeDataResponse } from "@/utils/resumeUtils";

interface UseResumeDataResult {
	data: ResumeDataResponse | null;
	isLoading: boolean;
	isError: boolean;
	error: string | null;
	isSuccess: boolean;
	refetch: () => Promise<void>;
}

export const resumeDataQueryKey = talentKeys.resumeData;

export const fetchResumeData = async (candidateId: string, resumeId?: string): Promise<ResumeDataResponse> => {
	logger.info("Fetching resume data for candidate", { candidateId, resumeId });
	const response = await getResumeData(candidateId, resumeId);

	if (!response.success) {
		throw new Error(response.error || response.message || "Failed to load resume data");
	}

	return response;
};

export function useResumeData(candidateId: string | undefined, resumeId?: string): UseResumeDataResult {
	const queryKey = candidateId ? talentKeys.resumeData(candidateId, resumeId) : ["cv-data-disabled"];

	const {
		data,
		isLoading,
		isError,
		error,
		refetch: queryRefetch,
	} = useQuery({
		queryKey,
		queryFn: () => {
			if (!candidateId) throw new Error("Candidate ID is required");
			return fetchResumeData(candidateId, resumeId);
		},
		enabled: !!candidateId,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
	});

	const refetch = async () => {
		await queryRefetch();
	};

	const errorMessage = isError ? (error instanceof Error ? error.message : "An unexpected error occurred") : null;

	return {
		data: data ?? null,
		isLoading,
		isError,
		error: errorMessage,
		isSuccess: !isLoading && !isError && !!data,
		refetch,
	};
}
