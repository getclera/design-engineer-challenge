import type { QueryClient } from "@tanstack/react-query";
import { authKeys } from "@/lib/query-keys";

export function invalidateAuthMe(queryClient: QueryClient): void {
	void queryClient.invalidateQueries({ queryKey: authKeys.me() });
}
