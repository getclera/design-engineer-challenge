"use client";

import { useQuery } from "@tanstack/react-query";
import { orgDashboardKeys } from "@/lib/query-keys";
import { organizations, type SendoutListEntry } from "@/services/api/organizations";

export function useSendoutLists(orgId: string, roleId: string | undefined) {
	return useQuery<SendoutListEntry[]>({
		queryKey: orgDashboardKeys.sendouts(orgId, roleId ?? ""),
		enabled: !!roleId,
		queryFn: async () => {
			if (!roleId) return [];
			const result = await organizations.getSendoutLists(orgId, roleId);
			if (!result.ok) throw new Error("Failed to load sendout lists");
			return result.data.drops;
		},
	});
}
