const base = "/dashboard";

export const talentDashboardRoutes = {
	home: () => base,
	setup: () => "/setup",
	matches: () => `${base}/matches`,
	jobs: () => `${base}/jobs`,
	pipeline: () => `${base}/pipeline`,
	adminIntegrations: () => `${base}/admin-integrations`,
	waitlist: () => `${base}/waitlist`,
	referrals: () => `${base}/referrals`,
	opportunities: () => `${base}/opportunities`,
	company: (companyJobSlug: string) => `${base}/companies/${companyJobSlug.replace("#", "/")}`,
	interviewPrep: () => `${base}/interview-prep`,
	worth: () => `${base}/worth`,
	roast: () => `${base}/roast`,
	interview: () => `${base}/interview`,
	preferences: () => `${base}/preferences`,
	account: () => `${base}/account`,
	perks: () => `${base}/perks`,
	resume: () => `${base}/resume`,
	resumeBuilder: () => `${base}/resume/builder`,
	referral: () => `${base}/referral`,
};
