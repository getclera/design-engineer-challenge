"use client";

import { useQuery } from "@tanstack/react-query";
import { useRolesList } from "@v2/features/org-roles";
import { useMemo } from "react";
import { companyKeys } from "@/lib/query-keys";
import { companyContacts, organizations, unwrap } from "@/services/api";
import { candidatesGoNowhere, type Delivery } from "../org-settings/delivery";
import { deliveryKey } from "../org-settings/keys";
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

/**
 * The Settings badge in the sidebar: what stops candidates reaching you. Roles that can't book intros (the Members
 * tab count) plus new candidates going nowhere (the Communications tab count), so fixing either clears it here too.
 */
function useContactsActionNeededCount(orgId: string, enabled: boolean) {
	const { data: delivery } = useQuery({
		queryKey: deliveryKey(orgId),
		queryFn: () => organizations.getDeliveryChannels(orgId).then(unwrap) as Promise<unknown> as Promise<Delivery>,
		enabled: enabled && !!orgId,
	});
	return useIntroBlockers(orgId, enabled).length + (delivery && candidatesGoNowhere(delivery) ? 1 : 0);
}

export { useContactsActionNeededCount, useIntroBlockers };
