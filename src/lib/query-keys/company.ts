export const companyKeys = {
	all: ["companies"] as const,

	lists: () => [...companyKeys.all, "list"] as const,
	search: (searchTerm: string) => [...companyKeys.all, "search", searchTerm] as const,
	dashboard: (searchTerm: string, dateRange: unknown, minActivityScore?: number, selectedOwners?: unknown) =>
		[...companyKeys.all, "dashboard", searchTerm, dateRange, minActivityScore, selectedOwners] as const,

	details: () => [...companyKeys.all, "detail"] as const,
	detail: (idOrSlug: string) => [...companyKeys.details(), idOrSlug] as const,
	full: (companyId: string) => [...companyKeys.all, "full", companyId] as const,
	adminFlags: (companyId: string) => [...companyKeys.all, "admin-flags", companyId] as const,
	publicWithJobs: (slug: string) => [...companyKeys.all, "public-with-jobs", slug] as const,

	jobs: (companyId: string) => [...companyKeys.all, "jobs", companyId] as const,
	pipeline: (companyId: string, dateRange: number) => [...companyKeys.all, "pipeline", companyId, dateRange] as const,
	requirements: (companyId: string) => [...companyKeys.all, "requirements", companyId] as const,
	contacts: (companyId: string) => [...companyKeys.all, "contacts", companyId] as const,
	contactOptions: (companyId: string) => [...companyKeys.all, "contact-options", companyId] as const,
	membership: (companyId: string) => [...companyKeys.all, "membership", companyId] as const,
	similar: (companyId: string, companySize?: string) =>
		[...companyKeys.all, "similar", companyId, companySize] as const,
	requests: (includeResponded?: boolean) => [...companyKeys.all, "requests", includeResponded] as const,

	agentLog: (companyId: string) => [...companyKeys.all, "agent-log", companyId] as const,

	callActivity: (companyId: string) => [...companyKeys.all, "call-activity", companyId] as const,
	callDetail: (companyId: string, callId: string) => [...companyKeys.all, "call-detail", companyId, callId] as const,

	atsIntegrationRequest: (orgId: string) => [...companyKeys.all, "ats-integration-request", orgId] as const,
	atsConnection: (orgId: string) => [...companyKeys.all, "ats-connection", orgId] as const,
	atsRemoteRoles: (orgId: string) => [...companyKeys.all, "ats-remote-roles", orgId] as const,
	deliveryChannels: (companyId: string) => [...companyKeys.all, "delivery-channels", companyId] as const,

	pipelineSearch: (searchTerm: string) => [...companyKeys.all, "pipeline-search", searchTerm] as const,
};
