"use client";

import { useQuery } from "@tanstack/react-query";
import { talentKeys } from "@/lib/query-keys";
import { unwrap } from "@/services/api";
import { talents } from "@/services/api/talents";

export function useHeaderData(talentId: string) {
	return useQuery({
		queryKey: talentKeys.headerData(talentId),
		queryFn: () => talents.fetchHeaderData(talentId).then(unwrap),
		staleTime: Number.POSITIVE_INFINITY,
		enabled: !!talentId,
	});
}
