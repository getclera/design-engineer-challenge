export const authKeys = {
	all: ["auth"] as const,
	me: () => [...authKeys.all, "me"] as const,
	meAuthed: () => [...authKeys.all, "me", "authed"] as const,
	profile: (userId: string) => [...authKeys.all, "profile", userId] as const,
	session: () => [...authKeys.all, "session"] as const,
	organizations: () => [...authKeys.all, "organizations"] as const,
	company: () => [...authKeys.all, "company"] as const,

	organizationMembers: (orgId: string) => [...authKeys.all, "organizations", orgId, "members"] as const,
	organizationInvitations: (orgId: string) => [...authKeys.all, "organizations", orgId, "invitations"] as const,
	organizationDetails: (orgId: string) => [...authKeys.all, "organization-details", orgId] as const,

	connectedAccounts: () => [...authKeys.all, "connected-accounts"] as const,
};
