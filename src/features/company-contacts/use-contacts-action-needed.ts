"use client";

import { useQuery } from "@tanstack/react-query";
import { companyKeys } from "@/lib/query-keys";
import { companyContacts, unwrap } from "@/services/api";

function useContactsActionNeededCount(orgId: string, enabled: boolean) {
	const { data } = useQuery({
		queryKey: companyKeys.contactOptions(orgId),
		queryFn: () => companyContacts.listActive(orgId).then(unwrap),
		enabled: enabled && !!orgId,
	});

	if (!data) return 0;
	return data.some((contact) => contact.calendarLink) ? 0 : 1;
}

export { useContactsActionNeededCount };
