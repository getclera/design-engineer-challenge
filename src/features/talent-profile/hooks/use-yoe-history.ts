import { useQuery } from "@tanstack/react-query";
import { talentKeys } from "@/lib/query-keys";
import { talentEnrichment, unwrap } from "@/services/api";

export function useYoeHistory(talentId: string, enabled: boolean) {
	return useQuery({
		queryKey: talentKeys.yoeHistory(talentId),
		queryFn: () => talentEnrichment.getYoeHistory(talentId).then(unwrap),
		enabled,
		staleTime: 30_000,
	});
}
