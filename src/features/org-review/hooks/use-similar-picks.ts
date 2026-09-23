"use client";

import { useQuery } from "@tanstack/react-query";
import { orgDashboardKeys } from "@/lib/query-keys";
import { organizations, unwrap } from "@/services/api";
import type { SimilarPick } from "../types";

const SIMILAR_PICKS_STALE_MS = 10 * 60_000;

export function similarPicksKey(orgId: string, roleId: string, talentId: string) {
	return orgDashboardKeys.similarPicks(orgId, roleId, talentId);
}

export function useSimilarPicks(orgId: string, roleId: string | null, talentId: string | null) {
	return useQuery({
		queryKey: similarPicksKey(orgId, roleId ?? "", talentId ?? ""),
		queryFn: () =>
			organizations
				.getSimilarPicks<SimilarPick>(orgId, { roleId: roleId ?? "", talentId: talentId ?? "" })
				.then(unwrap),
		enabled: !!orgId && !!roleId && !!talentId,
		staleTime: SIMILAR_PICKS_STALE_MS,
		retry: false,
	});
}
