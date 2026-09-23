import { z } from "zod";
import { Decision, FitBucket, FitLevel, KeyFactorSignal, MatchStrength, RejectionCategory } from "./enums.ts";

export const ELO_MINIMUM_THRESHOLD = 400;

export const MIN_TALENTS_PER_SENDOUT = 2;

const BLIND_AUTO_SUBMIT_COMPANIES = {
	aniva: "2c61b6cb-0bd4-48b5-a236-24732c4f86fc",
} as const;

export const BLIND_AUTO_SUBMIT_COMPANY_IDS: ReadonlySet<string> = new Set(Object.values(BLIND_AUTO_SUBMIT_COMPANIES));

export function companyAutoSubmitsBlindApplications(companyId: string | null | undefined): boolean {
	return companyId != null && BLIND_AUTO_SUBMIT_COMPANY_IDS.has(companyId);
}

const ENGINE_X_MARGIN_COMPANIES = { clera: "e55adcd4-b7ce-4333-a5f6-691126c6db15" } as const;
export const ENGINE_X_MARGIN_COMPANY_IDS: ReadonlySet<string> = new Set(Object.values(ENGINE_X_MARGIN_COMPANIES));
export function companyUsesRubricMargins(companyId: string | null | undefined): boolean {
	return companyId != null && ENGINE_X_MARGIN_COMPANY_IDS.has(companyId);
}

export const RUBRIC_PSEUDO_COUNT = 10;

export const HARD_GATE_MIN_N_EFF = RUBRIC_PSEUDO_COUNT + 5;

export const INTRO_FIT_GATE_COMPANY_IDS: ReadonlySet<string> = new Set(["7e6198de-ab4c-4ed4-b72e-c4ed8edb956a"]);

const ELO_BYPASS_SOURCES: ReadonlySet<string> = new Set(["partner-recruiter", "personal"]);

export function sourceBypassesEloFloor(source: string | null | undefined): boolean {
	return source != null && ELO_BYPASS_SOURCES.has(source.toLowerCase());
}

export const ELO_FAST_TRACK_THRESHOLD = 600;

export const NON_ACTIONABLE_TALENT_STATUSES = ["backlog", "unfit", "fake_profile", "blacklisted"] as const;
export type NonActionableTalentStatus = (typeof NON_ACTIONABLE_TALENT_STATUSES)[number];

export const TALENT_SEARCH_STATUSES = [
	"signup",
	"new",
	"welcome",
	"sent_opportunities",
	"no_opps",
	"reacted_to_opps",
	"moved_to_process",
	"submittable",
	"in_process",
	"waiting",
	"find_new_roles",
	"backlog",
	"unfit",
	"blacklisted",
	"hired",
	"requesting_information",
	"linkedin",
	"call",
	"call_ended",
	"submitted",
	"screened",
	"referred",
	"double",
	"personal",
	"interview_taken",
	"active",
	"completed",
] as const;

export const ACTIONABLE_TALENT_STATUSES = TALENT_SEARCH_STATUSES.filter(
	(s): s is Exclude<(typeof TALENT_SEARCH_STATUSES)[number], NonActionableTalentStatus> =>
		!(NON_ACTIONABLE_TALENT_STATUSES as readonly string[]).includes(s),
);

export const REVERSE_SOURCING_MIN_QUALIFIED_SCORE = 50;
const REVERSE_SOURCING_MIN_MAYBE_SCORE = 30;

export function scoreFitLabel(score: number): string {
	if (score >= REVERSE_SOURCING_MIN_QUALIFIED_SCORE) return "GOOD_FIT";
	if (score >= REVERSE_SOURCING_MIN_MAYBE_SCORE) return "MAYBE";
	return "BAD_FIT";
}

export const CAMPAIGN_DELAY_HOURS_DEFAULT = 0;
export const CAMPAIGN_DELAY_HOURS_MAX = 72;

export const CampaignDelayHoursSchema = z
	.number()
	.int()
	.min(0)
	.max(CAMPAIGN_DELAY_HOURS_MAX)
	.default(CAMPAIGN_DELAY_HOURS_DEFAULT);

export const CampaignDelayHoursFormSchema = z.coerce
	.number()
	.int()
	.min(0)
	.max(CAMPAIGN_DELAY_HOURS_MAX)
	.default(CAMPAIGN_DELAY_HOURS_DEFAULT);

export const CombinedSourcingInputSchema = z.object({
	jobId: z.string().guid(),
	targetCount: z.number().int().positive().default(500),
	campaignDelayHours: CampaignDelayHoursSchema,
	maxTalents: z.number().int().positive().default(2000),
});

export const SOURCING_SESSION_STATUSES = [
	"pending",
	"searching",
	"calibrating",
	"ready_for_review",
	"executing",
	"completed",
	"failed",
	"queued",
	"running",
	"post_pipeline",
	"enrichment",
	"scoring",
	"query_generation",
	"pending_review",
	"pending_final_review",
	"canceled",
	"cancelled",
	"skipped",
	"starting",
	"loading_job",
	"initializing",
	"agent_running",
	"post_evaluation",
	"enriching",
] as const;
export const SourcingSessionStatusSchema = z.enum(SOURCING_SESSION_STATUSES);
export type SourcingSessionStatus = (typeof SOURCING_SESSION_STATUSES)[number];
export const DEFAULT_VISIBLE_SOURCING_SESSION_STATUSES = SOURCING_SESSION_STATUSES.filter(
	(status) => status !== "failed",
) as Exclude<SourcingSessionStatus, "failed">[];

export const FIT_LEVELS = [FitLevel.Strong, FitLevel.Moderate, FitLevel.Weak, FitLevel.None] as const;
export const FitLevelSchema = z.nativeEnum(FitLevel).superRefine((v, ctx) => {
	if (v === FitLevel.Error || v === FitLevel.ErrorOtherRecoverable || v === FitLevel.Curated) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: `fit=${v} is not a valid LLM output` });
	}
});

export const FitLevelWithErrorSchema = z.nativeEnum(FitLevel);

export const QUALIFIED_FIT_LEVELS = [FitLevel.Strong, FitLevel.Moderate] as const;

export const EMAIL_ELIGIBLE_FIT_LEVELS = [FitLevel.Strong, FitLevel.Moderate, FitLevel.Weak, FitLevel.Curated] as const;
export const SOURCING_QUALIFIED_FIT_LEVELS = EMAIL_ELIGIBLE_FIT_LEVELS;

export const isQualifiedFit = (fit: FitLevel | string | null | undefined): boolean =>
	fit === FitLevel.Strong || fit === FitLevel.Moderate;
export const isSourcingQualifiedFit = (fit: FitLevel | string | null | undefined): boolean =>
	(EMAIL_ELIGIBLE_FIT_LEVELS as readonly string[]).includes(fit ?? "");

export const FailureCategorySchema = z.enum([
	"match",
	"function_mismatch",
	"missing_tech_stack",
	"missing_role_experience",
	"seniority_mismatch",
	"company_stage_mismatch",
	"geo_or_visa",
	"language",
	"rubric_too_strict",
	"other",
]);
export type FailureCategory = z.infer<typeof FailureCategorySchema>;

export const FIT_SCORE_MAP: Readonly<Record<FitLevel, number>> = {
	[FitLevel.Strong]: 85,
	[FitLevel.Moderate]: 65,
	[FitLevel.Weak]: 40,
	[FitLevel.None]: 0,
	[FitLevel.Error]: 0,
	[FitLevel.ErrorOtherRecoverable]: 0,
	[FitLevel.Curated]: 0,
};

export const MOCK_FIT_LEVEL_WEIGHTS: readonly [number, number, number, number] = [0.3, 0.55, 0.85, 1.0];

export const createEmptyFitLevelCounts = (): Record<FitLevel, number> => ({
	[FitLevel.Strong]: 0,
	[FitLevel.Moderate]: 0,
	[FitLevel.Weak]: 0,
	[FitLevel.None]: 0,
	[FitLevel.Error]: 0,
	[FitLevel.ErrorOtherRecoverable]: 0,
	[FitLevel.Curated]: 0,
});

export const DecisionSchema = z.nativeEnum(Decision);
export const FitBucketSchema = z.nativeEnum(FitBucket);
export const MatchStrengthSchema = z.nativeEnum(MatchStrength);
export const RejectionCategorySchema = z.nativeEnum(RejectionCategory);
export const KeyFactorSignalSchema = z.nativeEnum(KeyFactorSignal);

export const MOBILE_CHANNELS = ["whatsapp", "imessage", "sms"] as const;
export const MobileChannelSchema = z.enum(MOBILE_CHANNELS);

export const TALENT_ACTIVITY_PROVIDERS = [
	"email",
	"linkedin",
	"imessage",
	"whatsapp",
	"sms",
	"slack",
	"api",
	"agent",
	"mobile",
] as const;
export const TalentActivityProviderSchema = z.enum(TALENT_ACTIVITY_PROVIDERS);

export const CONVERSATION_CHANNELS = ["linkedin", "imessage", "email", "chatbot"] as const;
export const ConversationChannelSchema = z.enum(CONVERSATION_CHANNELS);

export const OUTREACH_CHANNELS = ["email", "x", "linkedin"] as const;
export type OutreachChannel = (typeof OUTREACH_CHANNELS)[number];

export const OUTREACH_CHANNEL_LABELS: Record<OutreachChannel, string> = {
	email: "Email",
	x: "X (Twitter)",
	linkedin: "LinkedIn",
};

export const CHANNEL_CATEGORIES = ["email", "whatsapp", "imessage", "linkedin", "sms"] as const;
export const ChannelCategorySchema = z.enum(CHANNEL_CATEGORIES);

export const MESSAGE_ISSUE_SOURCES = ["instantly", "maracuja", "trigger", "imessage", "whatsapp", "sms"] as const;
export const MessageIssueSourceSchema = z.enum(MESSAGE_ISSUE_SOURCES);

export const LANDING_MEDIUMS = ["imessage", "whatsapp", "waitlist"] as const;
export const LandingMediumSchema = z.enum(LANDING_MEDIUMS);

export const OPPORTUNITY_FUNNEL_LADDER = [
	"potential",
	"submitted",
	"process",
	"offer_made",
	"offer_accepted",
	"started",
] as const satisfies readonly OpportunityStatusValue[];

export const OPPORTUNITY_STATUSES = [
	...OPPORTUNITY_FUNNEL_LADDER,
	"no_fit",
] as const satisfies readonly OpportunityStatusValue[];
export const OpportunityStatusSchema = z.enum(OPPORTUNITY_STATUSES);

export type OpportunityStatusValue = (typeof OPPORTUNITY_STATUSES_ALL)[number];

export const OPPORTUNITY_STATUSES_ALL = [
	"potential",
	"process",
	"offer_made",
	"offer_accepted",
	"started",
	"no_fit",
	"submitted",
	"todo_confirm",
	"issues",
] as const;

export const OPPORTUNITY_QUESTION_STATUSES = ["empty", "draft", "submitted", "edit", "finalized"] as const;

export const OPP_STATUS_LABELS: Record<string, string> = {
	no_fit: "No Fit",
	potential: "Potential",
	submitted: "Submitted",
	process: "In Process",
	offer_made: "Offer Made",
	offer_accepted: "Offer Accepted",
	started: "Started",
};

export const REJECT_SOURCE_NOTES: Record<string, string> = {
	candidate: "Rejected by the candidate",
	company: "Rejected by the company",
	clera: "Rejected by Clera",
	agent: "Rejected by the Clera agent",
};

export const INTERVIEW_PIPELINE_STATUSES = [
	"process",
	"offer_made",
	"offer_accepted",
	"started",
] as const satisfies readonly OpportunityStatusValue[];

export const ADVANCED_PIPELINE_STATUSES = [
	"submitted",
	...INTERVIEW_PIPELINE_STATUSES,
] as const satisfies readonly OpportunityStatusValue[];

export const DROP_PENDING_STATUSES = ["potential"] as const satisfies readonly OpportunityStatusValue[];

export const ORG_ENGAGED_STATUSES = [
	...ADVANCED_PIPELINE_STATUSES,
] as const satisfies readonly OpportunityStatusValue[];

export const REQUIREMENT_TYPES = ["DEALBREAKER", "REQUIRED", "OPTIONAL", "NICE_TO_HAVE", "MUSTHAVE"] as const;
export const RequirementTypeSchema = z.enum(REQUIREMENT_TYPES);

export const REQUIREMENT_GROUPS = [
	"TECHNICAL_SKILLS",
	"HARD_SKILLS",
	"SOFT_SKILLS",
	"EXPERIENCE",
	"DOMAIN_EXPERIENCE",
	"OTHER",
	"OPERATIONAL",
	"OVERALL_FIT",
	"SKILLS",
	"ROLE_ALIGNMENT",
	"INDUSTRY_SPECIFIC",
	"WORK_EXPERIENCE",
	"TRAITS_TO_AVOID",
	"EDUCATION",
	"MISC",
	"YEARS_OF_EXPERIENCE",
	"LANGUAGE",
	"TIMEZONE",
] as const;
export const RequirementGroupSchema = z.enum(REQUIREMENT_GROUPS);

export const RequirementSchema = z.object({
	description: z.string(),
	type: z.string().optional(),
	group: z.string().optional(),
	active: z.union([z.boolean(), z.string().transform((val) => val === "true")]).optional(),
	priority: z.number().optional(),
	source: z.enum(["partner", "ai", "internal"]).optional(),
});

export const JOB_SEARCH_SESSION_STATUSES = [
	"initializing",
	"processing",
	"completed",
	"ready_for_next",
	"invalidated",
	"failed",
] as const;
export const JobSearchSessionStatusSchema = z.enum(JOB_SEARCH_SESSION_STATUSES);

export const ACTIVE_SEARCH_STATUSES: readonly JobSearchSessionStatus[] = ["initializing", "processing"];

export type JobSearchSessionStatus = (typeof JOB_SEARCH_SESSION_STATUSES)[number];

export const HandpickedTalentExperienceSchema = z.object({
	title: z.string().nullable(),
	company: z.string().nullable(),
	companyLogoUrl: z.string().nullable(),
	companyUrl: z.string().nullable().optional(),
	durationLabel: z.string().nullable(),
	description: z.string().nullable(),
	companyIndustry: z.string().nullable(),
	companyEmployeeCount: z.number().nullable(),
});

export const HandpickedTalentEducationSchema = z.object({
	school: z.string().nullable(),
	schoolLogoUrl: z.string().nullable(),
	schoolUrl: z.string().nullable().optional(),
	degree: z.string().nullable(),
	fieldOfStudy: z.string().nullable(),
	durationLabel: z.string().nullable(),
});

export const HandpickedTalentSchema = z.object({
	talentId: z.string().guid(),
	talentName: z.string(),
	talentLinkedinUrl: z.string().nullable(),
	talentOneliner: z.string().nullable(),
	talentAvatarUrl: z.string().nullable(),
	talentLocation: z.string().nullable(),
	talentOccupation: z.string().nullable(),
	yearsExperience: z.number().nullable(),
	salaryLowerBound: z.number().nullable(),
	salaryUpperBound: z.number().nullable(),
	salaryCurrency: z.string().nullable(),
	visaSponsorshipNeeded: z.boolean().nullable(),
	talentWillingToRelocate: z.boolean(),
	talentTags: z.array(z.string()),
	experiences: z.array(HandpickedTalentExperienceSchema),
	education: z.array(HandpickedTalentEducationSchema),
});

export type HandpickedTalentExperience = z.infer<typeof HandpickedTalentExperienceSchema>;
export type HandpickedTalentEducation = z.infer<typeof HandpickedTalentEducationSchema>;
export type HandpickedTalent = z.infer<typeof HandpickedTalentSchema>;
