export const orgDashboardKeys = {
	all: ["org-dashboard"] as const,
	review: (orgId: string, roleId?: string) => [...orgDashboardKeys.all, "review", orgId, roleId] as const,
	passed: (orgId: string, roleId?: string) => [...orgDashboardKeys.all, "passed", orgId, roleId] as const,
	sendouts: (orgId: string, roleId: string) => [...orgDashboardKeys.all, "sendouts", orgId, roleId] as const,
	similarPicks: (orgId: string, roleId: string, talentId: string) =>
		[...orgDashboardKeys.all, "similar-picks", orgId, roleId, talentId] as const,
	talentChips: (orgId: string, talentIds: readonly string[]) =>
		[...orgDashboardKeys.all, "talent-chips", orgId, talentIds] as const,
	interviewTracker: (orgId: string) => [...orgDashboardKeys.all, "interview-tracker", orgId] as const,
	searchesList: (orgId: string, page: number) => [...orgDashboardKeys.all, "searches-list", orgId, page] as const,
	searchDetail: (orgId: string, searchId: string) =>
		[...orgDashboardKeys.all, "search-detail", orgId, searchId] as const,
};

export function isTalentChipsKey(queryKey: readonly unknown[]) {
	return queryKey[1] === "talent-chips";
}
