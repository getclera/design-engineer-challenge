export const authRoutes = {
	root: "/auth",
	signup: "/signup",
	accountDeleted: "/account-deleted",
	error: (message?: string) => (message ? `/error?message=${encodeURIComponent(message)}` : "/error"),
	unauthorized: "/unauthorized",
	unauthorizedForOrg: (orgId: string) => `/unauthorized?org=${encodeURIComponent(orgId)}`,
	login: (params?: { email?: string; error?: string }) => {
		const query = new URLSearchParams();
		if (params?.email) query.set("email", params.email);
		if (params?.error) query.set("error", params.error);
		const search = query.toString();
		return search ? `/login?${search}` : "/login";
	},
	loginWithRedirect: (redirectTo: string) => `/login?redirect=${encodeURIComponent(redirectTo)}`,
	signupIntent: (opts?: { email?: string; next?: string }) => {
		const params = new URLSearchParams();
		if (opts?.email) params.set("email", opts.email);
		if (opts?.next) params.set("next", opts.next);
		const query = params.toString();
		return query ? `/signup/intent?${query}` : "/signup/intent";
	},
	ssoCallback: (next?: string, opts?: { resume?: boolean; ticket?: string }) => {
		const params = new URLSearchParams();
		if (opts?.ticket) params.set("ticket", opts.ticket);
		if (next) params.set("next", next);
		if (opts?.resume) params.set("resume", "1");
		const query = params.toString();
		return query ? `/sso-callback?${query}` : "/sso-callback";
	},
	oauthConsent: () => "/oauth-consent",
	refreshClaims: (next: string) => `/auth/refresh?next=${encodeURIComponent(next)}`,
	signinComplete: (next?: string, opts?: { provider?: "google" | "linkedin_oidc" }) => {
		const params = new URLSearchParams();
		if (next) params.set("next", next);
		if (opts?.provider) params.set("provider", opts.provider);
		const query = params.toString();
		return query ? `/signin/complete?${query}` : "/signin/complete";
	},
} as const;
