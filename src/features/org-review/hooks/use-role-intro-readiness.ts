"use client";

import { useQuery } from "@tanstack/react-query";
import { type RoleIntroReadiness, resolveRoleIntroReadiness } from "@v2/features/company-contacts";
import { useRolesList } from "@v2/features/org-roles";
import { useCallback } from "react";
import { companyKeys } from "@/lib/query-keys";
import { companyContacts, unwrap } from "@/services/api";

export function useRoleIntroReadiness(orgId: string) {
	const { data: contacts } = useQuery({
		queryKey: companyKeys.contactOptions(orgId),
		queryFn: () => companyContacts.listActive(orgId).then(unwrap),
		enabled: !!orgId,
		staleTime: 0,
		refetchOnMount: "always",
	});
	const { data: roles } = useRolesList(orgId, false);

	const readinessFor = useCallback(
		(roleId: string): RoleIntroReadiness => {
			if (!contacts || !roles) return { ready: true };
			const role = roles.find((candidate) => candidate.id === roleId);
			if (!role) return { ready: true };
			return resolveRoleIntroReadiness(contacts, role.companyContactId);
		},
		[contacts, roles],
	);

	return { readinessFor };
}
