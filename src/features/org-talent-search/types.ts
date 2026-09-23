import type {
	fitFlagSchema,
	orgTalentSearchResponseSchema,
} from "@edge-functions/organization-service/schemas-talent-search";
import {
	type BooleanSearchScope,
	type BooleanSearchTag,
	DEFAULT_ORG_CAREER_FILTERS,
	type GeolocationValue,
	type OrgCareerActiveFilters,
	SCOPE_ORDER,
} from "@v2/features/talent-search-filters";
import type { z } from "zod";

export const ORG_BOOLEAN_SEARCH_SCOPES: BooleanSearchScope[] = SCOPE_ORDER.filter((scope) => scope !== "all_fields");

export type OrgTalentActiveFilters = {
	search_term: string;
	boolean_tags: BooleanSearchTag[];
	geolocations: GeolocationValue[];
	countries: string[];
	role_names: string[];
	skills: string[];
	work_history: string[];
	education_history: string[];
	job_types: string[];
	preferred_work: string[];
	years_experience_min: number | null;
	years_experience_max: number | null;
	expected_salary_min: number | null;
	expected_salary_max: number | null;
	open_to_relocation: boolean | null;
	visa_sponsorship_needed: boolean | null;
	use_vector_search: boolean;
	job_id: string | null;
} & OrgCareerActiveFilters;

export const DEFAULT_ORG_TALENT_FILTERS: OrgTalentActiveFilters = {
	search_term: "",
	boolean_tags: [],
	geolocations: [],
	countries: [],
	role_names: [],
	skills: [],
	work_history: [],
	education_history: [],
	job_types: [],
	preferred_work: [],
	years_experience_min: null,
	years_experience_max: null,
	expected_salary_min: null,
	expected_salary_max: null,
	open_to_relocation: null,
	visa_sponsorship_needed: null,
	use_vector_search: false,
	job_id: null,
	...DEFAULT_ORG_CAREER_FILTERS,
};

export const ROLE_PREFILLED_FILTER_KEYS = [
	"role_names",
	"skills",
	"job_types",
	"countries",
	"geolocations",
	"years_experience_min",
	"years_experience_max",
	"expected_salary_max",
	"visa_sponsorship_needed",
] as const satisfies readonly (keyof OrgTalentActiveFilters)[];

export type RolePrefilledFilterKey = (typeof ROLE_PREFILLED_FILTER_KEYS)[number];

export type RoleFilterDefaults = Pick<OrgTalentActiveFilters, RolePrefilledFilterKey>;

export type OrgTalentState = "reviewed" | "in_review";

export type OrgTalentFitFlag = z.infer<typeof fitFlagSchema>;

type OrgTalentSearchRoleContext = Pick<z.infer<typeof orgTalentSearchResponseSchema>, "role" | "conflicts" | "counts">;

export interface OrgTalentSearchHit {
	id: string;
	full_name: string | null;
	org_state?: OrgTalentState | null;
	headline?: string;
	location?: string;
	years_experience?: number;
	skills?: string[];
	roles?: string[];
	avatar_url?: string;
	linkedin_url?: string;
	talent_oneliner?: string;
	talent_bullets?: string[] | null;
	flags?: OrgTalentFitFlag[];
}

export interface OrgTalentSearchPagination {
	page: number;
	perPage: number;
	totalHits: number;
	totalPages: number;
}

export interface OrgTalentSearchResponse extends OrgTalentSearchRoleContext {
	success: boolean;
	talents: OrgTalentSearchHit[];
	semantic?: boolean;
	pagination: OrgTalentSearchPagination;
}
