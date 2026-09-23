export type OrgTalentSurface =
	| "review"
	| "review_similar"
	| "review_passed"
	| "talent_sheet"
	| "talents_table"
	| "talent_search"
	| "dashboard";

export interface OrgTalentTracking {
	orgId: string;
	talentId: string;
	surface: OrgTalentSurface;
	roleId?: string | null;
	opportunityId?: number | null;
	source?: string | null;
}

export const orgTalentEventProps = (tracking: OrgTalentTracking) => ({
	org_id: tracking.orgId,
	talent_id: tracking.talentId,
	surface: tracking.surface,
	role_id: tracking.roleId ?? null,
	opportunity_id: tracking.opportunityId ?? null,
	source: tracking.source ?? null,
});

export type LinkedinClickElement = "icon" | "name" | "cell" | "row";

export const linkedinClickedEventProps = (tracking: OrgTalentTracking, element: LinkedinClickElement, url: string) => ({
	...orgTalentEventProps(tracking),
	element,
	linkedin_url: url,
});
