import { type QueryClient, useQuery } from "@tanstack/react-query";
import { orgTalentKeys } from "@/lib/query-keys";
import { unwrap } from "@/services/api";
import { orgTalents } from "@/services/api/org-talents";

const STALE_TIME = 5 * 60 * 1000;

function profileQueryFn(orgId: string, talentId: string) {
	return orgTalents.fetchProfile(orgId, talentId).then(unwrap);
}

export function useOrgTalentProfile(orgId: string, talentId: string) {
	return useQuery({
		queryKey: orgTalentKeys.profile(orgId, talentId),
		queryFn: () => profileQueryFn(orgId, talentId),
		staleTime: STALE_TIME,
		enabled: !!orgId && !!talentId,
	});
}

export function prefetchOrgTalentProfile(queryClient: QueryClient, orgId: string, talentId: string) {
	return queryClient.prefetchQuery({
		queryKey: orgTalentKeys.profile(orgId, talentId),
		queryFn: () => profileQueryFn(orgId, talentId),
		staleTime: STALE_TIME,
	});
}

export function ensureOrgTalentProfile(queryClient: QueryClient, orgId: string, talentId: string) {
	return queryClient.ensureQueryData({
		queryKey: orgTalentKeys.profile(orgId, talentId),
		queryFn: () => profileQueryFn(orgId, talentId),
		staleTime: STALE_TIME,
	});
}

function publicDropProfileQueryFn(dropId: string, talentId: string) {
	return orgTalents.fetchPublicDropProfile(dropId, talentId).then(unwrap);
}

export function usePublicDropTalentProfile(dropId: string, talentId: string) {
	return useQuery({
		queryKey: orgTalentKeys.publicDropProfile(dropId, talentId),
		queryFn: () => publicDropProfileQueryFn(dropId, talentId),
		staleTime: STALE_TIME,
		enabled: !!dropId && !!talentId,
		retry: 2,
	});
}

export function prefetchPublicDropTalentProfile(queryClient: QueryClient, dropId: string, talentId: string) {
	return queryClient.prefetchQuery({
		queryKey: orgTalentKeys.publicDropProfile(dropId, talentId),
		queryFn: () => publicDropProfileQueryFn(dropId, talentId),
		staleTime: STALE_TIME,
	});
}
