import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { roleKeys } from "@/lib/query-keys";
import { organizations } from "@/services/api";
import type { OrgRole } from "../types";

export function useRolesList(orgId: string, showDeleted: boolean, enabled = true) {
	return useQuery<OrgRole[]>({
		queryKey: roleKeys.organizationRoles(orgId, showDeleted),
		queryFn: async () => {
			const result = await organizations.listRoles<{ roles: OrgRole[] }>(orgId, {
				includeDeleted: showDeleted,
			});
			if (!result.ok) {
				throw new Error("Failed to fetch roles");
			}
			return result.data?.roles ?? [];
		},
		enabled: !!orgId && enabled,
		staleTime: 10_000,
		placeholderData: keepPreviousData,
	});
}
