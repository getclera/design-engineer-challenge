const base = "/talents";

export const talentRoutes = {
	listing: base,
	profile: (talentId: string, linkedinSlug?: string | null) =>
		linkedinSlug ? `${base}/${linkedinSlug}/${talentId}` : `${base}/${talentId}`,
};

const adminApiBase = "/api/admin/talents";

export const adminTalentApiRoutes = {
	dataExport: (talentId: string, regime: "gdpr" | "ccpa" = "gdpr") =>
		`${adminApiBase}/${talentId}/data-export?regime=${regime}`,
	state: (talentId: string) => `${adminApiBase}/${talentId}/state`,
	stateAssertions: (talentId: string) => `${adminApiBase}/${talentId}/state/assertions`,
	stateAssertionRetract: (talentId: string, assertionId: string) =>
		`${adminApiBase}/${talentId}/state/assertions/${assertionId}/retract`,
	close: (talentId: string) => `${adminApiBase}/${talentId}/close`,
	engagementPulse: (talentId: string) => `${adminApiBase}/${talentId}/engagement-pulse`,
	paraformMarketStatus: (talentId: string) => `${adminApiBase}/${talentId}/paraform-market-status`,
};

export const adminPrivacyApiRoutes = {
	decisions: "/api/admin/privacy/decisions",
	pendingErasures: "/api/admin/privacy/pending-erasures",
};
