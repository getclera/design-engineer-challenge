const root = "/organization";
const LITERAL_SEGMENTS: readonly string[] = ["access", "onboarding", "invite", "create"];

function base(orgId: string) {
	return `${root}/${orgId}`;
}

export function orgIdFromPath(path: string): string | null {
	const segment = path.match(/^\/organization\/([^/?]+)/)?.[1];
	return segment && !LITERAL_SEGMENTS.includes(segment) ? segment : null;
}

function roleTalentPath(path: string, roleId?: string, talentId?: string) {
	const query = new URLSearchParams();
	if (roleId) query.set("role", roleId);
	if (talentId) query.set("talent", talentId);
	const suffix = query.toString();
	return `${path}${suffix ? `?${suffix}` : ""}`;
}

export const orgRoutes = {
	root,
	access: `${root}/access`,
	detail: (orgId: string) => base(orgId),
	subpath: (orgId: string, subPath: string) => `${base(orgId)}/${subPath.replace(/^\//, "")}`,
	onboarding: "/organization/onboarding",
	onboardingRequirements: "/organization/onboarding/requirements",
	inviteAccept: "/organization/invite/accept",
	clerkInviteAccept: (token: string, orgId: string) => `/organization/invite/accept/clerk/${token}/${orgId}`,
	overview: (orgId: string) => base(orgId),
	home: (orgId: string) => `${base(orgId)}/review`,
	homeWithError: (orgId: string, error: string) => `${base(orgId)}/review?error=${encodeURIComponent(error)}`,
	review: (orgId: string, roleId?: string, talentId?: string) =>
		roleTalentPath(`${base(orgId)}/review`, roleId, talentId),
	reviewSendout: (orgId: string, nanoId: string) => `${base(orgId)}/review?sendout=${encodeURIComponent(nanoId)}`,
	signupCompany: (orgId: string, companyId: string) => `${base(orgId)}/review?signup-company=${companyId}`,
	talentSearch: (orgId: string, params?: { talentId?: string; filters?: Record<string, string> }) => {
		const query = new URLSearchParams();
		if (params?.talentId) query.set("talent", params.talentId);
		if (params?.filters) {
			for (const [key, value] of Object.entries(params.filters)) {
				query.set(key, value);
			}
		}
		const suffix = query.toString();
		return `${base(orgId)}/talent-search${suffix ? `?${suffix}` : ""}`;
	},
	externalSearch: (orgId: string) => `${base(orgId)}/external-search`,
	pipeline: (orgId: string, roleId?: string, talentId?: string) =>
		roleTalentPath(`${base(orgId)}/pipeline`, roleId, talentId),
	integrations: (orgId: string) => `${base(orgId)}/integrations`,
	integrationsRoles: (orgId: string) => `${base(orgId)}/integrations/roles`,
	integrationsRolePicker: (orgId: string) => `${base(orgId)}/integrations/roles?from=email`,
	members: (orgId: string) => `${base(orgId)}/members`,

	roles: {
		list: (orgId: string) => `${base(orgId)}/roles`,
		new: (orgId: string) => `${base(orgId)}/roles/new`,
		detail: (orgId: string, roleId: string) => `${base(orgId)}/roles/${roleId}`,
		edit: (orgId: string, roleId: string, options?: { isNew?: boolean; highlightHm?: boolean }) =>
			`${base(orgId)}/roles/${roleId}/edit${options?.isNew ? "?new=1" : options?.highlightHm ? "?highlight=hm" : ""}`,
	},

	searches: {
		list: (orgId: string) => `${base(orgId)}/searches`,
		detail: (orgId: string, searchId: string) => `${base(orgId)}/searches/${searchId}`,
	},

	settings: {
		root: (orgId: string) => `${base(orgId)}/settings`,
		company: (orgId: string) => `${base(orgId)}/settings/company`,
		delivery: (orgId: string) => `${base(orgId)}/settings/delivery`,
		contacts: (orgId: string, highlightContactId?: string) =>
			`${base(orgId)}/settings/contacts${highlightContactId ? `?highlight=${highlightContactId}` : ""}`,
		members: (orgId: string, options?: { invite?: boolean; email?: string }) => {
			const query = new URLSearchParams();
			if (options?.invite) query.set("invite", "1");
			if (options?.invite && options?.email) query.set("email", options.email);
			const suffix = query.toString();
			return `${base(orgId)}/settings/members${suffix ? `?${suffix}` : ""}`;
		},
		workspace: (orgId: string) => `${base(orgId)}/settings/workspace`,
		profile: (orgId: string) => `${base(orgId)}/settings/profile`,
	},
};
