export const matchRoutes = {
	root: "/match",
	page: (nanoId: string) => `/match/${nanoId}`,
	validateApi: "/api/public/match/validate",
	landingApi: (nanoId: string) => `/api/public/match/${nanoId}`,
	interestApi: (nanoId: string) => `/api/public/match/${nanoId}/interest`,
	previewApi: (nanoId: string) => `/api/admin/match-link/preview/${nanoId}`,
} as const;
