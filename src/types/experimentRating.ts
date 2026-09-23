export interface RequirementDetail {
	requirement: string;
	optional: string;
	score: number;
	reasons: string[];
	missingInformation: string[];
	requirementFit?: "GOOD_FIT" | "BAD_FIT" | "MAYBE";
	type?: "DEALBREAKER" | "OPTIONAL" | "MUST_HAVE" | "REQUIRED" | "NULL";
	group?: "TRAITS_TO_AVOID" | "SOFT_SKILLS" | "WORK_EXPERIENCE" | "EDUCATION" | "MISC" | "TECHNICAL" | "NULL";
}

export interface CalibrationResponse {
	results: RequirementDetail[];
}

export interface ExperimentRating {
	id: string;
	job_id: string;
	talent_id: string;
	created_at: string;
	requirements_score: number;
	requirements_missing_info: string | null;
	requirements_details: RequirementDetail[];
	matchmaking_version?: string;
	job?: {
		id: string;
		position: string;
		company_name?: string;
		company_logo_url?: string;
	};
}
