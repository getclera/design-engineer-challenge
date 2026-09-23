const base = "/chat";

export const chatRoutes = {
	home: base,
	webOnboarding: `${base}?start=web`,
	webOnboardingWithAttribution: (params: Record<string, string>) =>
		`${base}?${new URLSearchParams({ start: "web", ...params }).toString()}`,
};
