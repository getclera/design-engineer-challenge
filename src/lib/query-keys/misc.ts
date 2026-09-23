export const miscKeys = {
	all: ["misc"] as const,

	allTags: () => [...miscKeys.all, "all-tags"] as const,
	allUniqueLocations: () => [...miscKeys.all, "all-unique-locations"] as const,
	allUniqueSources: () => [...miscKeys.all, "all-unique-sources"] as const,
	industries: () => [...miscKeys.all, "industries"] as const,

	waitlist: () => [...miscKeys.all, "waitlist"] as const,

	csvExportAccess: () => [...miscKeys.all, "csv-export-access"] as const,

	triggerToken: (runId: string) => [...miscKeys.all, "trigger-token", runId] as const,

	engagementState: (hitId: string) => [...miscKeys.all, "engagement-state", hitId] as const,

	interviewRequests: (...params: string[]) => [...miscKeys.all, "interview-requests", ...params] as const,

	placementsMonthly: (monthsBack: number) => [...miscKeys.all, "placements-monthly", monthsBack] as const,
	goalsOverview: () => [...miscKeys.all, "goals-overview"] as const,

	partnerAccounts: () => [...miscKeys.all, "partner-accounts"] as const,

	profileData: (interactionId: string) => [...miscKeys.all, "profile-data", interactionId] as const,

	interview: () => [...miscKeys.all, "interview"] as const,

	talentsData: () => [...miscKeys.all, "talents-data"] as const,

	linkedinProfile: () => [...miscKeys.all, "linkedin-profile"] as const,

	potentialDuplicates: (statusFilter?: string) => [...miscKeys.all, "potential-duplicates", statusFilter] as const,

	dashboardStatus: (talentId?: string) => [...miscKeys.all, "dashboard-status", talentId] as const,

	matchmakingActivity: (activityId?: string | null) => [...miscKeys.all, "matchmaking-activity", activityId] as const,

	marketInsights: (talentId?: string) => [...miscKeys.all, "market-insights", talentId] as const,

	dashboardDeltas: (talentId?: string) => [...miscKeys.all, "dashboard-deltas", talentId] as const,

	profileStrength: (talentId?: string) => [...miscKeys.all, "profile-strength", talentId] as const,

	referrer: (slug: string) => [...miscKeys.all, "referrer", slug] as const,

	myReferrals: () => [...miscKeys.all, "my-referrals"] as const,
	myReferralStats: (window: 30 | 90 | "all") => [...miscKeys.all, "my-referral-stats", window] as const,

	githubStatus: () => [...miscKeys.all, "github-status"] as const,

	talentChannels: () => [...miscKeys.all, "talent-channels"] as const,

	matchmakingRuns: () => [...miscKeys.all, "matchmaking-runs"] as const,

	activeNumbers: () => [...miscKeys.all, "active-numbers"] as const,

	brandLogo: (query: string) => [...miscKeys.all, "brand-logo", query] as const,

	emailDomainVerification: (domain: string) => [...miscKeys.all, "email-domain-verification", domain] as const,

	asyncFilterSuggest: (cacheKey: string, query: string) =>
		[...miscKeys.all, "async-filter-suggest", cacheKey, query] as const,

	reverseSearchSession: (sessionId: string) => [...miscKeys.all, "reverse-search-session", sessionId] as const,
	reverseSearchSessionReviewSheet: (sessionId: string, talentCount: number) =>
		[...miscKeys.all, "reverse-search-session", sessionId, "review-sheet", talentCount] as const,
	sixtyfourSearches: () => [...miscKeys.all, "sixtyfour-searches"] as const,
	sixtyfourTamSettings: () => [...miscKeys.all, "sixtyfour-tam-settings"] as const,
	sixtyfourTamContacted: (weeks?: number) => [...miscKeys.all, "sixtyfour-tam-contacted", weeks ?? "all"] as const,
	sixtyfourStatus: (searchId: string) => [...miscKeys.all, "sixtyfour-status", searchId] as const,
	sixtyfourResults: (
		searchId: string,
		page: number,
		pageSize: number,
		onlyWithEmail?: boolean,
		onlyVerified?: boolean,
		excludeDuplicates?: boolean,
	) =>
		[
			...miscKeys.all,
			"sixtyfour-results",
			searchId,
			page,
			pageSize,
			onlyWithEmail,
			onlyVerified,
			excludeDuplicates,
		] as const,
};
