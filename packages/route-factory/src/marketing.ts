export const marketingRoutes = {
	home: "/",
	hire: "/hire",
	terms: "/terms",
	privacy: "/privacy",
	referral: "/referral",
	resumeReview: "/resume-review",
	about: "/about",
	contact: "/contact",
	imprint: "/imprint",
	manifesto: "/manifesto",
	engineering: "/engineering",
	careers: "/careers",
	press: "/press",
	acquihire: "/acquihire",
	bugBounty: "/bug-bounty",
	emails: "/emails",
	emailVerification: (domain: string) => `/emails/${encodeURIComponent(domain)}`,
	ai: "/ai",
	signupDisabled: "/signup-disabled",
	recruitingPartner: "/recruiting-partner",
	recruitingPartnerSubmit: "/recruiting-partner#submit-candidate",
	blog: "/blog",
	blogTalent: "/blog/for-talent",
	blogCompanies: "/blog/for-companies",
	blogList: (options: { page?: number; category?: string; audience?: string } = {}) => {
		const { page = 1, category, audience } = options;
		const filteredCategory = category && category !== "all" ? category : undefined;

		if (page === 1 && !filteredCategory) {
			if (audience === "talent") return "/blog/for-talent";
			if (audience === "company") return "/blog/for-companies";
			return "/blog";
		}

		const query = new URLSearchParams();
		if (filteredCategory) query.set("category", filteredCategory);
		if (audience && audience !== "all") query.set("audience", audience);
		const suffix = query.toString();
		return suffix ? `/blog/page/${page}?${suffix}` : `/blog/page/${page}`;
	},
	blogPost: (slug: string) => `/blog/${slug}`,
	compare: "/compare",
	comparePage: (slug: string) => `/compare/${slug}`,
	cohort: "/cohort",
	merch: "/merch",
	layoffs: "/layoffs",
	events: "/events",
	eventsList: (options: { page?: number } = {}) => {
		const { page = 1 } = options;
		return page === 1 ? "/events" : `/events/page/${page}`;
	},
	mcp: "/mcp",
	techWeek: "/tech-week",
	mcpWaitlist: "/mcp#waitlist",
	mcpDocs: "/mcp/docs",
	faq: "/faq",
	salaryBenchmark: "/salary-benchmark",
	hiringData: "/tech-salaries",
	hiringDataExplore: (filters: Record<string, string | null | undefined> = {}) => {
		const query = new URLSearchParams();
		for (const key of [
			"region",
			"country",
			"role",
			"skill",
			"seniority",
			"currency",
			"industry",
			"city",
			"roleCluster",
		]) {
			const value = filters[key];
			if (value) query.set(key, value);
		}
		const suffix = query.toString();
		return suffix ? `/tech-salaries?${suffix}` : "/tech-salaries";
	},
	worth: "/worth",
	worthResult: (shareId: string) => `/worth/${shareId}`,
	worthStoryImage: (shareId: string) => `/worth/${shareId}/story-image`,
	roast: "/roast",
	elo: "/elo",
	onboarding: "/onboarding",
	onboardingUrl: (opts?: { email?: string; next?: string; role?: string; error?: string }) => {
		const params = new URLSearchParams();
		if (opts?.next) params.set("next", opts.next);
		if (opts?.email) params.set("email", opts.email);
		if (opts?.role) params.set("role", opts.role);
		if (opts?.error) params.set("error", opts.error);
		const query = params.toString();
		return query ? `/onboarding?${query}` : "/onboarding";
	},
	onboardingWithError: (code: string) => `/onboarding?error=${encodeURIComponent(code)}`,
	onboardingWithEmail: (email: string) => `/onboarding?email=${encodeURIComponent(email)}`,
	onboardingWithRole: (role: string) => `/onboarding?role=${encodeURIComponent(role)}`,
	onboardingWithNext: (next: string) => `/onboarding?next=${encodeURIComponent(next)}`,
	partners: "/partners",
	partner: (slug: string) => `/partner/${slug}`,
	integrations: "/integrations",
	pricing: "/pricing",
	linkedinChallenge: (groupId: string, email?: string) => {
		const qs = new URLSearchParams({ group: groupId });
		if (email?.includes("@")) qs.set("email", email);
		return `/linkedin?${qs.toString()}`;
	},
	news: "/news",
	newsArticle: (slug: string) => `/news/${slug}`,
	caseStudies: {
		index: "/case-studies",
		superchat: "/case-studies/superchat",
		pluno: "/case-studies/pluno",
		aranya: "/case-studies/aranya",
		monroeSuperchat: "/case-studies/monroe-superchat",
	},
};
