"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@v2/components/ui/select";
import { ReviewCountBadge, useRolesList } from "@v2/features/org-roles";
import type { ReviewListData } from "@v2/lib/review-feed";
import { useCallback } from "react";
import { ALL_ROLES_PARAM } from "./constants";
import { setReviewUrlParams } from "./review-url";

interface ReviewRoleFilterProps {
	orgId: string;
	roleId?: string;
	byRole: ReviewListData["byRole"];
	onChange: (roleId: string | undefined) => void;
}

export function ReviewRoleFilter({ orgId, roleId, byRole, onChange }: ReviewRoleFilterProps) {
	const { data: roles = [], isLoading } = useRolesList(orgId, false);
	const selectableRoles = roles.filter((r) => (r.status ?? "").toLowerCase() !== "deleted");

	const handleChange = useCallback(
		(value: string) => {
			onChange(value === ALL_ROLES_PARAM ? undefined : value);
			setReviewUrlParams({ role: value });
		},
		[onChange],
	);

	if (!isLoading && selectableRoles.length === 0) return null;

	return (
		<Select value={roleId ?? ALL_ROLES_PARAM} onValueChange={handleChange} disabled={isLoading}>
			<SelectTrigger
				size="compact"
				className="h-7 w-auto min-w-52 max-w-xs border border-v2-border-default bg-transparent"
			>
				<SelectValue placeholder="All roles" className="whitespace-nowrap" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={ALL_ROLES_PARAM} size="compact" hideIndicator>
					All roles
				</SelectItem>
				{selectableRoles.map((role) => {
					const counts = byRole[role.id];
					const status = (role.status ?? "").toLowerCase();
					return (
						<SelectItem
							key={role.id}
							value={role.id}
							size="compact"
							hideIndicator
							trailing={
								counts && counts.pending > 0 ? (
									<ReviewCountBadge count={counts.pending} truncated={counts.truncated} />
								) : undefined
							}
						>
							<span className="inline-flex items-center gap-1.5">
								{role.position}
								{status !== "active" && <span className="text-v2-text-tertiary text-2xs capitalize">{status}</span>}
							</span>
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);
}

ReviewRoleFilter.displayName = "ReviewRoleFilter";
