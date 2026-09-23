import { type QueryClient, useQuery } from "@tanstack/react-query";
import { talentKeys } from "@/lib/query-keys";
import { unwrap } from "@/services/api";
import { resumes } from "@/services/api/resumes";

const STALE_TIME = 30 * 60 * 1000;
const GC_TIME = 45 * 60 * 1000;

function primaryResumeQueryFn(talentId: string, orgId?: string) {
	return resumes.getPrimary(talentId, orgId).then(unwrap);
}

export function usePrimaryResume(talentId: string, scope?: { orgId?: string } | null) {
	return useQuery({
		queryKey: talentKeys.primaryResume(talentId, scope?.orgId),
		queryFn: () => primaryResumeQueryFn(talentId, scope?.orgId),
		enabled: !!talentId && scope !== null,
		staleTime: STALE_TIME,
		gcTime: GC_TIME,
	});
}

export function prefetchPrimaryResume(queryClient: QueryClient, talentId: string, orgId?: string) {
	return queryClient.prefetchQuery({
		queryKey: talentKeys.primaryResume(talentId, orgId),
		queryFn: () => primaryResumeQueryFn(talentId, orgId),
		staleTime: STALE_TIME,
		gcTime: GC_TIME,
	});
}
