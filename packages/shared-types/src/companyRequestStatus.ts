import { z } from "zod";

export const COMPANY_REQUEST_STATUSES = [
	"ready",
	"todo_confirm",
	"issues",
	"unclear",
	"outreach",
	"infomissing",
	"submitted",
	"process",
	"declined",
	"noresp",
] as const;

export type CompanyRequestStatus = (typeof COMPANY_REQUEST_STATUSES)[number];

export const FAST_TRACK_INTEREST_WINDOW_DAYS = 60;

export const TALENT_NOT_OPEN_ERROR = "talent_not_open_for_opportunities";

export const STATUS_LABEL: Record<CompanyRequestStatus, string> = {
	ready: "Ready to submit",
	todo_confirm: "TODO confirm",
	issues: "Issues",
	unclear: "Unclear",
	infomissing: "Information missing",
	outreach: "In outreach",
	submitted: "Submitted",
	process: "In process",
	declined: "Declined",
	noresp: "No response",
};

export const STATUS_SECTION_ORDER: readonly CompanyRequestStatus[] = [
	"ready",
	"todo_confirm",
	"issues",
	"unclear",
	"outreach",
	"infomissing",
	"submitted",
	"process",
	"declined",
	"noresp",
];

const CLOSED_STATUSES = ["process", "submitted", "declined"] as const;

export type ClosedCompanyRequestStatus = (typeof CLOSED_STATUSES)[number];

const CLOSED_STATUS_SET = new Set<CompanyRequestStatus>(CLOSED_STATUSES);

export function isClosedStatus(status: CompanyRequestStatus): status is ClosedCompanyRequestStatus {
	return CLOSED_STATUS_SET.has(status);
}

export const companyRequestVisibilitySchema = z.enum(["open", "all"]);

export type CompanyRequestVisibility = z.infer<typeof companyRequestVisibilitySchema>;

export const companyRequestStatusTargetSchema = z.enum([
	"ready",
	"todo_confirm",
	"issues",
	"process",
	"submitted",
	"declined",
	"reset",
]);
export type CompanyRequestStatusTarget = z.infer<typeof companyRequestStatusTargetSchema>;

export const companyRequestStatusSchema = z.enum(COMPANY_REQUEST_STATUSES);

export const companyRequestSourceSchema = z.enum([
	"paraform_parser",
	"company_dashboard",
	"admin_dashboard",
	"gucci_agent",
	"gabana_agent",
	"leo_agent",
	"cleon_agent",
	"company_request_agent",
	"email_digest",
	"slack",
	"auto_submit",
	"public_drop",
	"role_sourcing",
	"peter_agent",
	"mcp",
	"similar_picks",
]);
export type CompanyRequestSource = z.infer<typeof companyRequestSourceSchema>;

export const dashboardActionOriginSchema = z.enum([
	"company_dashboard",
	"similar_picks",
	"mcp",
	"gabana_agent",
	"gucci_agent",
]);
export type DashboardActionOrigin = z.infer<typeof dashboardActionOriginSchema>;
export const USER_ACTION_ORIGINS: ReadonlySet<string> = new Set<DashboardActionOrigin>([
	"company_dashboard",
	"similar_picks",
	"mcp",
]);

export const companyRequestTriggeredBySchema = z.object({
	affiliation: z.enum(["clera", "company", "unknown"]),
	name: z.string().nullish(),
	email: z.string().nullish(),
	title: z.string().nullish(),
	profileId: z.string().guid().nullish(),
	contactId: z.string().guid().nullish(),
});
export type CompanyRequestTriggeredBy = z.infer<typeof companyRequestTriggeredBySchema>;

export function isParaformRequestSource(source: string | null | undefined): boolean {
	return source === "paraform_parser";
}
