"use client";

import { useRolesList } from "@v2/features/org-roles";
import type { ReviewListData } from "@v2/lib/review-feed";
import { useMemo } from "react";

export type ReviewEmptyScenario = "list-done" | "role-done" | "all-done" | "role-paused";

export interface ReviewEmptyRoleTarget {
	id: string;
	position: string;
	pending: number;
}

interface ReviewEmptyScenarioResult {
	scenario: ReviewEmptyScenario;
	otherRoles: ReviewEmptyRoleTarget[];
	roleName: string | null;
	rolePending: number;
	isResolved: boolean;
}

export function useReviewEmptyScenario(
	orgId: string,
	roleId: string | undefined,
	hasActiveSendout: boolean,
	roleFeedCount: number,
	byRole: ReviewListData["byRole"],
	pausedPending: ReviewListData["pausedPending"],
): ReviewEmptyScenarioResult {
	const { data: roles = [], isPending: rolesPending } = useRolesList(orgId, false);
	const isResolved = !rolesPending;

	return useMemo(() => {
		const otherRoles = roles
			.filter((role) => role.status === "active" && role.id !== roleId)
			.map((role) => ({ id: role.id, position: role.position, pending: byRole[role.id]?.pending ?? 0 }))
			.filter((role) => role.pending > 0)
			.sort((a, b) => b.pending - a.pending);
		const selectedRole = roleId ? roles.find((role) => role.id === roleId) : undefined;
		const roleName = selectedRole?.position ?? null;
		const rolePending = roleId ? (byRole[roleId]?.pending ?? pausedPending[roleId] ?? 0) : 0;
		const isPausedRole = !!selectedRole && (selectedRole.status ?? "").toLowerCase() !== "active";
		const detected: ReviewEmptyScenario = isPausedRole
			? "role-paused"
			: hasActiveSendout && roleFeedCount > 0
				? "list-done"
				: otherRoles.length > 0
					? "role-done"
					: "all-done";
		return { scenario: detected, otherRoles, roleName, rolePending, isResolved };
	}, [roles, byRole, pausedPending, roleId, hasActiveSendout, roleFeedCount, isResolved]);
}
