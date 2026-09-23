"use client";

import { useReviewQueueCounts, useRolesList } from "@v2/features/org-roles";
import { useEffect, useRef, useState } from "react";
import { orgReviewFiltersKey } from "../constants";

function readPersistedRole(orgId: string): string | null {
	if (typeof window === "undefined") return null;
	const stored = window.localStorage.getItem(orgReviewFiltersKey(orgId));
	return stored ? new URLSearchParams(stored).get("role") : null;
}

export function useDefaultReviewRole(
	orgId: string,
	enabled: boolean,
	onResolve: (roleParam: string | undefined) => void,
): void {
	const [persistedRole] = useState(() => readPersistedRole(orgId));
	const needsFallback = enabled && !persistedRole;
	const { data: roles } = useRolesList(orgId, false, needsFallback);
	const { data: queueCounts } = useReviewQueueCounts(orgId, needsFallback);
	const counts = queueCounts?.byRole;
	const onResolveRef = useRef(onResolve);
	onResolveRef.current = onResolve;
	const resolved = useRef(false);

	useEffect(() => {
		if (!enabled || resolved.current) return;
		if (new URLSearchParams(window.location.search).has("role")) {
			resolved.current = true;
			return;
		}
		if (persistedRole) {
			resolved.current = true;
			onResolveRef.current(persistedRole);
			return;
		}
		if (!roles || !counts) return;
		resolved.current = true;
		const activeRoles = roles.filter((role) => role.status === "active");
		const bestRole = [...activeRoles].sort((a, b) => (counts[b.id]?.pending ?? 0) - (counts[a.id]?.pending ?? 0))[0];
		onResolveRef.current(bestRole?.id);
	}, [enabled, persistedRole, roles, counts]);
}
