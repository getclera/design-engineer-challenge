export const ORG_FEEDBACK_REASONS = [
	"bug",
	"missing_feature",
	"candidate_quality",
	"confusing_ux",
	"slow_or_broken",
	"praise",
	"other",
] as const;

export type OrgFeedbackReason = (typeof ORG_FEEDBACK_REASONS)[number];

export const ORG_FEEDBACK_SENTIMENTS = ["frustrated", "confused", "delighted", "neutral"] as const;

export type OrgFeedbackSentiment = (typeof ORG_FEEDBACK_SENTIMENTS)[number];

export const ORG_FEEDBACK_SOURCES = ["dashboard", "mcp_agent", "admin_mcp"] as const;

export type OrgFeedbackSource = (typeof ORG_FEEDBACK_SOURCES)[number];

export const ORG_FEEDBACK_CALLER_SOURCES = ["dashboard", "mcp_agent"] as const satisfies readonly OrgFeedbackSource[];

export const ORG_FEEDBACK_SOURCE = {
	dashboard: "dashboard",
	mcpAgent: "mcp_agent",
	adminMcp: "admin_mcp",
} as const satisfies Record<string, OrgFeedbackSource>;
