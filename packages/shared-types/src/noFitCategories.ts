export const COMPANY_NO_FIT_CATEGORY_IDS = [
	"too_senior",
	"too_junior",
	"missing_skills",
	"wrong_background",
	"salary_expectations",
	"location_mismatch",
	"visa",
	"already_in_pipeline",
] as const;

export const LEGACY_NO_FIT_CATEGORY_IDS = [
	"company_stage_mismatch",
	"below_talent_bar",
	"wrong_domain",
	"startup_fit",
	"culture_fit",
	"other",
	"experience_skills_mismatch",
	"cultural_stage_fit",
	"timing_availability",
	"role_specific",
	"match_quality",
	"candidate_already_in_contact",
	"job_not_available_anymore",
] as const;

export type CompanyNoFitCategoryId = (typeof COMPANY_NO_FIT_CATEGORY_IDS)[number];

export const COMPANY_NO_FIT_CATEGORY_LABELS: Record<CompanyNoFitCategoryId, string> = {
	too_senior: "Too senior",
	too_junior: "Too junior",
	missing_skills: "Missing skills",
	wrong_background: "Wrong background",
	salary_expectations: "Comp too high",
	location_mismatch: "Location / remote",
	visa: "Visa / work permit",
	already_in_pipeline: "Already in pipeline",
};

export function noFitCategoryLabel(id: string): string {
	return (COMPANY_NO_FIT_CATEGORY_LABELS as Record<string, string>)[id] ?? id.replaceAll("_", " ");
}

export const STALE_NO_FIT_CATEGORY_IDS = ["stale_never_interacted", "stale_low_score", "stale_unscored"] as const;

export type StaleNoFitCategoryId = (typeof STALE_NO_FIT_CATEGORY_IDS)[number];

export const TALENT_DISMISSAL_COOLDOWN_DAYS = 30;

export const COMPANY_INTEREST_CATEGORY_IDS = [
	"strong_stack_match",
	"great_trajectory",
	"domain_fit",
	"founder_energy",
] as const;

export type CompanyInterestCategoryId = (typeof COMPANY_INTEREST_CATEGORY_IDS)[number];

export const TALENT_DISMISSAL_REJECT_SOURCE = "candidate";
export const TALENT_DISMISSAL_NO_FIT_CATEGORY = "candidate_not_interested";
