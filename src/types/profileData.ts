import type { WorkplaceType } from "@clera/shared-types";
import type { Profile } from "./user";

export interface ExtendedProfile extends Profile {
	preferred_company_size?: string[];
	preferred_company_funding_stage?: string[];
	preferred_industry?: string[];
	skills?: Skill[];
	salary_upper_bound?: number;
	salary_currency?: string;

	visa_sponsorship_needed?: boolean | null;
	visa_sponsorship_needed_text?: string;
	visa_sponsorship_further_details?: string;
	preferred_work_geolocations?: {
		lat: number;
		lng: number;
		label: string;
		radius?: number;
	}[];
}

export interface LinkItem {
	type: string;
	address: string;
}

import type { EngagementState } from "@clera/db/types";

export type { EngagementState } from "@clera/db/types";

export type PreferenceImportance = "DEALBREAKER" | "IMPORTANT" | "NICE_TO_HAVE" | null;

export interface AIInteractionData {
	id: string;
	avatar_url?: string | null;
	email?: string | null;
	open_for_opportunities?: boolean;
	allow_company_outreach?: boolean;
	allow_direct_submission?: boolean;
	engagement_state?: EngagementState | null;
	job_search_status?: EngagementState | null;
	job_types?: string[];
	job_types_importance?: PreferenceImportance;
	available_start_date?: string;
	notice_period?: string | null;
	preferred_work_environment?: WorkplaceType[];
	preferred_work_environment_importance?: PreferenceImportance;
	salary_lower_bound?: number | null;
	salary_upper_bound?: number | null;
	salary_currency?: string;
	salary_importance?: PreferenceImportance;
	willingness_to_relocate?: string[];
	location_importance?: PreferenceImportance;
	github_url?: string;
	x_url?: string | null;
	linkedin_url?: string | null;
	portfolio_url?: string;
	other_links?: LinkItem[];
	phone?: string | null;
	years_experience?: number | null;
	yoe_explainer?: string | null;
	visa_sponsorship_needed?: boolean | null;
	visa_sponsorship_needed_text?: string;
	visa_sponsorship_type?: string[];
	visa_sponsorship_further_details?: string;
	visa_sponsorship_importance?: PreferenceImportance;
	preferred_work_geolocations?: {
		lat: number;
		lng: number;
		label: string;
		radius?: number;
	}[];
	preferred_job_comment?: string;
	preferred_company_size?: string[];
	preferred_company_funding_stage?: string[];
	preferred_industry?: string[];
	skills?: Skill[];
	roles?: string[] | null;
	referredBy?: string;
	blocked_companies?: string[];
	occupation?: string | null;
}

export interface CandidateProfileData {
	id: string;
	profile?: Profile | null;
	aiData?: AIInteractionData | null;
}

export interface JobInfo {
	id: string;
	position: string | null;
	company: string | null;
	linkToJob: string | null;
}

export interface Skill {
	name: string;
	skill_level?: string;
	skill_experience_years?: number;
}

export type ProfileFieldType =
	| "text"
	| "email"
	| "tel"
	| "url"
	| "number"
	| "date"
	| "textarea"
	| "select"
	| "multiselect"
	| "checkbox"
	| "switch"
	| "geolocations";

export interface ProfileFormField {
	key: keyof ExtendedProfile;
	label: string;
	type: ProfileFieldType;
	placeholder?: string;
	required?: boolean;
	options?: { value: string; label: string }[];
	validation?: (value: unknown) => string | null;
}
