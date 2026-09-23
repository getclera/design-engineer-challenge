export const roleKeys = {
	all: ["roles"] as const,

	lists: () => [...roleKeys.all, "list"] as const,
	allPublic: () => [...roleKeys.all, "all-public"] as const,

	details: () => [...roleKeys.all, "detail"] as const,
	detail: (orgId: string, roleId: string) => [...roleKeys.details(), orgId, roleId] as const,

	requirements: (roleId: string) => [...roleKeys.all, "requirements", roleId] as const,
	interviewStages: (roleId: string) => [...roleKeys.all, "interview-stages", roleId] as const,
	locations: (roleId: string) => [...roleKeys.all, "locations", roleId] as const,
	questions: (orgId: string, roleId: string) => [...roleKeys.all, "questions", orgId, roleId] as const,
	questionsById: (roleId: string) => [...roleKeys.all, "questions", roleId] as const,

	talents: (orgId: string, roleId: string) => [...roleKeys.all, "talents", orgId, roleId] as const,
	sourcing: (orgId: string, roleId: string) => [...roleKeys.all, "sourcing", orgId, roleId] as const,

	organizationRoles: (orgId: string, showDeleted?: boolean) =>
		[...roleKeys.all, "organization-roles", orgId, showDeleted] as const,
	organizationRolesAll: (orgId: string) => [...roleKeys.all, "organization-roles", orgId] as const,
	organizationRole: (orgId: string, roleId: string) => [...roleKeys.all, "organization-role", orgId, roleId] as const,
	activity: (orgId: string, roleId: string) =>
		[...roleKeys.all, "organization-role", orgId, roleId, "activity"] as const,
};
