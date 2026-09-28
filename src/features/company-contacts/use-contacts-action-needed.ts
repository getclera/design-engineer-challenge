"use client";

import { useQuery } from "@tanstack/react-query";
import { useRolesList } from "@v2/features/org-roles";
import { useMemo } from "react";
import { companyKeys } from "@/lib/query-keys";
import { companyContacts, unwrap } from "@/services/api";
import { resolveRoleIntroReadiness } from "./hm-readiness";

/** Active roles whose intros can't be booked: no hiring manager, or one without a calendar link. */
function useIntroBlockers(orgId: string, enabled = true) {
	const { data: contacts } = useQuery({
		queryKey: companyKeys.contactOptions(orgId),
		queryFn: () => companyContacts.listActive(orgId).then(unwrap),
		enabled: enabled && !!orgId,
	});
	const { data: roles } = useRolesList(orgId, false, enabled);
	return useMemo(
		() =>
			contacts && roles
				? roles.filter(
						(role) => role.status === "active" && !resolveRoleIntroReadiness(contacts, role.companyContactId).ready,
					)
				: [],
		[contacts, roles],
	);
}

/** The Settings badge in the sidebar: the same count as Settings › Team, so fixing one clears the other. */
function useContactsActionNeededCount(orgId: string, enabled: boolean) {
	return useIntroBlockers(orgId, enabled).length;
}

export { useContactsActionNeededCount, useIntroBlockers };
