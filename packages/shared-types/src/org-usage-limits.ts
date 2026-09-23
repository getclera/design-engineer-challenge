import { z } from "zod";

export const ORG_DAILY_EXTERNAL_SEARCH_LIMIT = 10;
export const ORG_DAILY_CONTACT_LOOKUP_LIMIT = 25;
export const ORG_EXTERNAL_SEARCH_MAX_RESULTS = 50;

export const orgUsageMetricSchema = z.enum(["external_search", "contact_lookup"]);
export type OrgUsageMetric = z.infer<typeof orgUsageMetricSchema>;

export const ORG_USAGE_DAILY_LIMITS: Record<OrgUsageMetric, number> = {
	external_search: ORG_DAILY_EXTERNAL_SEARCH_LIMIT,
	contact_lookup: ORG_DAILY_CONTACT_LOOKUP_LIMIT,
};

const ORG_USAGE_LIMIT_MESSAGES: Record<OrgUsageMetric, string> = {
	external_search: `That's all ${ORG_DAILY_EXTERNAL_SEARCH_LIMIT} outside searches for today — they reset at 00:00 UTC. Tell me what you're hunting for and I'll have it queued up.`,
	contact_lookup: `${ORG_DAILY_CONTACT_LOOKUP_LIMIT} contact lookups is the daily ceiling, and you've used them. Resets at 00:00 UTC.`,
};

export function orgUsageLimitMessage(metric: OrgUsageMetric): string {
	return ORG_USAGE_LIMIT_MESSAGES[metric];
}

export const ORG_USAGE_LIMIT_ERROR_CODES: Record<OrgUsageMetric, string> = {
	external_search: "org_external_search_daily_limit",
	contact_lookup: "org_contact_lookup_daily_limit",
};

export const orgUsageSnapshotSchema = z.object({
	metric: orgUsageMetricSchema,
	used: z.number().int().min(0),
	limit: z.number().int().min(0),
	remaining: z.number().int().min(0),
	allowed: z.boolean(),
});
export type OrgUsageSnapshot = z.infer<typeof orgUsageSnapshotSchema>;
