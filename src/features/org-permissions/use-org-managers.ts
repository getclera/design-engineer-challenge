"use client";

import { getFullName } from "@clera/shared-utils";
import { useQuery } from "@tanstack/react-query";
import type { OrgRole } from "@/lib/auth/org-access";
import { authKeys } from "@/lib/query-keys";
import { organizations, unwrap } from "@/services/api";

interface OrgManager {
	id: string;
	name: string;
	email: string | null;
	roleLabel: string;
}

interface OrgMemberRow {
	id: string;
	role: OrgRole;
	firstName: string | null;
	lastName: string | null;
	email: string | null;
}

type ManagerScope = "managers" | "owners";

function useOrgManagers(orgId: string, scope: ManagerScope = "managers"): OrgManager[] {
	const { data } = useQuery({
		queryKey: authKeys.organizationMembers(orgId),
		queryFn: () => organizations.listMembers<{ members: OrgMemberRow[] }>(orgId).then(unwrap),
		enabled: !!orgId,
		staleTime: 60 * 1000,
	});

	return (data?.members ?? [])
		.filter((member) => member.role === "owner" || (scope === "managers" && member.role === "editor"))
		.map((member) => ({
			id: member.id,
			name: getFullName({ first_name: member.firstName, last_name: member.lastName }, member.email ?? undefined),
			email: member.email,
			roleLabel: member.role === "owner" ? "Owner" : "Member",
		}));
}

export type { ManagerScope };
export { useOrgManagers };
