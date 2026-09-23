export const talentKeys = {
	all: ["talent"] as const,

	orgSearchAll: (orgId: string) => [...talentKeys.all, "org-search", orgId] as const,
	orgSearch: (orgId: string, filters: object) => [...talentKeys.orgSearchAll(orgId), filters] as const,
	orgPinnedTalent: (orgId: string, talentId: string | null) =>
		[...talentKeys.all, "org-pinned-talent", orgId, talentId] as const,
	orgFacetSuggest: (orgId: string, field: string, query: string) =>
		[...talentKeys.all, "org-facet-suggest", orgId, field, query] as const,
	orgFacets: (orgId: string) => [...talentKeys.all, "org-facets", orgId] as const,
	orgRoleSearchFilters: (orgId: string, roleId: string) =>
		[...talentKeys.all, "org-role-search-filters", orgId, roleId] as const,
	orgBooleanSuggest: (orgId: string, query: string, scope: string, limit: number) =>
		[...talentKeys.all, "org-boolean-suggest", orgId, query, scope, limit] as const,

	headerData: (talentId: string) => [...talentKeys.all, "header", talentId] as const,
	opportunityCounts: (talentId: string) => [...talentKeys.all, "opportunity-counts", talentId] as const,
	preferencesData: (talentId: string) => [...talentKeys.all, "preferences-data", talentId] as const,
	mailPreferences: (talentIdOrNanoId: string) => [...talentKeys.all, "mail-preferences", talentIdOrNanoId] as const,

	stateAll: (talentId: string) => [...talentKeys.all, "state", talentId] as const,
	state: (talentId: string) => [...talentKeys.stateAll(talentId), "resolved"] as const,
	stateAssertions: (talentId: string, params: object) =>
		[...talentKeys.stateAll(talentId), "assertions", params] as const,

	mergedProfile: (talentId: string) => [...talentKeys.all, "merged-profile", talentId] as const,
	fitReason: (talentId: string, jobId?: string | null) =>
		[...talentKeys.all, "fit-reason", talentId, jobId ?? "any"] as const,
	responseTime: (talentId: string) => [...talentKeys.all, "response-time", talentId] as const,
	unifiedText: (talentId: string) => [...talentKeys.all, "unified-text", talentId] as const,
	deletePreview: (talentId: string) => [...talentKeys.all, "delete-preview", talentId] as const,
	selfDeletePreview: () => [...talentKeys.all, "self-delete-preview"] as const,

	details: () => [...talentKeys.all, "detail"] as const,
	detail: (orgId: string, talentId: string) => [...talentKeys.details(), orgId, talentId] as const,
	me: () => [...talentKeys.all, "me"] as const,
	currentInteraction: () => [...talentKeys.all, "current-interaction"] as const,

	cv: (orgId: string, talentId: string) => [...talentKeys.all, "cv", orgId, talentId] as const,
	resumeData: (talentId: string, resumeId?: string) => [...talentKeys.all, "cv-data", talentId, resumeId] as const,
	resumeList: (talentId: string) => [...talentKeys.all, "cv-list", talentId] as const,
	primaryResume: (talentId: string, orgId?: string) => [...talentKeys.all, "primary-resume", talentId, orgId] as const,
	resumeBlob: (talentId: string, orgId?: string, resumeId?: string) =>
		[...talentKeys.all, "resume-blob", talentId, orgId, resumeId] as const,
	resumeBuilder: () => [...talentKeys.all, "resume-builder"] as const,

	matchmakingRuns: (talentId: string) => [...talentKeys.all, "matchmaking-runs", talentId] as const,

	score: (talentId: string) => [...talentKeys.all, "score", talentId] as const,
	eloBreakdown: (talentId: string) => [...talentKeys.all, "elo-breakdown", talentId] as const,

	channels: (talentId: string) => [...talentKeys.all, "channels", talentId] as const,
	activities: () => [...talentKeys.all, "activities"] as const,
	activityRoleSearch: (params: object) => [...talentKeys.all, "activity-role-search", params] as const,
	combinedActivities: (talentId: string) => [...talentKeys.all, "combined-activities", talentId] as const,
	callActivity: (talentId: string) => [...talentKeys.all, "call-activity", talentId] as const,
	callDetail: (talentId: string, callId: string) => [...talentKeys.all, "call-detail", talentId, callId] as const,

	rowComments: (talentId: string) => [...talentKeys.all, "row-comments", talentId] as const,

	filters: (talentId: string, engine: string) => [...talentKeys.all, "filters", talentId, engine] as const,

	search: (filters: unknown, page: number, perPage: number, sort: unknown) =>
		[...talentKeys.all, "search", filters, page, perPage, sort] as const,
	searchFilters: () => [...talentKeys.all, "search-filters", "facets"] as const,
	searchJobBasic: (jobId: string) => [...talentKeys.all, "search", "job-basic", jobId] as const,
	searchBooleanSuggest: (query: string, scope: string, limit: number) =>
		[...talentKeys.all, "search", "boolean-suggest", query, scope, limit] as const,
	forRole: (orgId: string, roleId: string, page: number, perPage: number) =>
		[...talentKeys.all, "for-role", orgId, roleId, page, perPage] as const,
	bullets: (talentIdsKey: string) => [...talentKeys.all, "bullets", talentIdsKey] as const,

	opportunitiesAll: () => [...talentKeys.all, "opportunities"] as const,
	opportunities: (talentId: string) => [...talentKeys.opportunitiesAll(), talentId] as const,
	reviewOpportunities: (jobId: string) => [...talentKeys.all, "review-opportunities", jobId] as const,
	talentOpportunitiesAll: () => [...talentKeys.all, "talent-opportunities"] as const,
	talentOpportunities: (talentIds: string[], companyId: string) =>
		[...talentKeys.talentOpportunitiesAll(), talentIds, companyId] as const,

	tags: (talentId: string) => [...talentKeys.all, "tags", talentId] as const,
	talentRoles: (talentId: string) => [...talentKeys.all, "talent-roles", talentId] as const,
	professionalRoles: (talentId: string) => [...talentKeys.all, "roles", talentId] as const,

	talentAnalytics: (daysToShow: number, showAllTime: boolean, adminView: boolean, recruiterId?: string) =>
		[...talentKeys.all, "talent-analytics", daysToShow, showAllTime, adminView, recruiterId] as const,

	paginatedTalents: (...params: unknown[]) => [...talentKeys.all, "paginated-talents", ...params] as const,

	jobSearchStatus: () => [...talentKeys.all, "job-search-status"] as const,

	talentSearch: () => [...talentKeys.all, "talent-search"] as const,

	jobSearch: () => [...talentKeys.all, "job-search"] as const,
	jobSearchResults: (params: unknown) => [...talentKeys.jobSearch(), "search", params] as const,
	jobSearchFilters: (talentId: string) => [...talentKeys.jobSearch(), "filters", talentId] as const,
	jobSearchRoles: () => [...talentKeys.jobSearch(), "roles"] as const,
	jobSearchLiked: (jobIds: string[]) => [...talentKeys.jobSearch(), "liked", jobIds] as const,
	jobSearchFacets: () => [...talentKeys.jobSearch(), "facets"] as const,
	jobPageFilters: (talentId: string) => [...talentKeys.jobSearch(), "page-filters", talentId] as const,
	jobSearchAffinity: () => [...talentKeys.jobSearch(), "affinity"] as const,
	jobFit: (jobId: string) => [...talentKeys.jobSearch(), "fit", jobId] as const,

	yoeHistory: (talentId: string) => [...talentKeys.all, "yoe-history", talentId] as const,

	enrichmentLogs: (talentId: string) => [...talentKeys.all, "enrichment-logs", talentId] as const,
	auditLogs: (talentId: string) => [...talentKeys.all, "audit-logs", talentId] as const,
	pageVisits: (talentId: string) => [...talentKeys.all, "page-visits", talentId] as const,
	engagementPulse: (talentId: string) => [...talentKeys.all, "engagement-pulse", talentId] as const,
	paraformMarketStatus: (talentId: string) => [...talentKeys.all, "paraform-market-status", talentId] as const,
	triggerRuns: (talentId: string) => [...talentKeys.all, "trigger-runs", talentId] as const,
};
