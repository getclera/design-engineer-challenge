import type { QueryClient } from "@tanstack/react-query";
import { isTalentChipsKey, orgDashboardKeys } from "@/lib/query-keys";

export function invalidateOrgDashboard(queryClient: QueryClient) {
	queryClient.invalidateQueries({
		queryKey: orgDashboardKeys.all,
		predicate: (query) => !isTalentChipsKey(query.queryKey),
	});
}
