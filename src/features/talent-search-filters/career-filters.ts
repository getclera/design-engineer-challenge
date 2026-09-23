import type { CareerFiltersSchema, OrgCareerFiltersSchema } from "@edge-functions/talent-service/schemas";
import type { z } from "zod";

type CareerFilterInput = z.infer<typeof CareerFiltersSchema>;
type OrgCareerFilterInput = z.infer<typeof OrgCareerFiltersSchema>;

type ApiOnlyCareerFilterKey = "past_locations" | "current_company_industries" | "current_company_funding_stages";

type UiFilterValue<T> =
	NonNullable<T> extends readonly string[]
		? string[]
		: NonNullable<T> extends readonly unknown[]
			? NonNullable<T>
			: NonNullable<T> extends boolean
				? boolean | null
				: number | null;

type CareerActiveFilters = {
	[K in Exclude<keyof CareerFilterInput, ApiOnlyCareerFilterKey>]-?: UiFilterValue<CareerFilterInput[K]>;
};

type OrgCareerActiveFilters = Pick<CareerActiveFilters, keyof OrgCareerFilterInput>;

const DEFAULT_ORG_CAREER_FILTERS: OrgCareerActiveFilters = {
	current_titles: [],
	company_industries: [],
	current_company_sizes: [],
	company_funding_stages: [],
	months_at_current_company_min: null,
	average_tenure_months_min: null,
	startup_experience: null,
	degree_levels: [],
	highest_degree_levels: [],
	enrolled_degree_levels: [],
	fields_of_study: [],
	school_countries: [],
	degree_level_countries: [],
	graduation_year_min: null,
	graduation_year_max: null,
	certifications: [],
	timezones: [],
	utc_offset_min: null,
	utc_offset_max: null,
	current_title_levels: [],
	title_levels_held: [],
	current_company_hq_countries: [],
	company_hq_countries: [],
	career_flags: [],
	language_proficiencies: [],
	volunteer_experience: null,
	volunteer_organizations: [],
	volunteer_roles: [],
};

const DEFAULT_CAREER_FILTERS: CareerActiveFilters = {
	...DEFAULT_ORG_CAREER_FILTERS,
	current_companies: [],
	company_tags: [],
	current_company_founded_after: null,
	current_company_funded_within_months: null,
	months_in_current_role_min: null,
	months_in_current_role_max: null,
	months_at_current_company_max: null,
	promoted_at_current_company: null,
	between_roles: null,
	vc_backed_experience: null,
	founder_experience: null,
	laid_off_within_months: null,
};

export type { CareerActiveFilters, OrgCareerActiveFilters };
export { DEFAULT_CAREER_FILTERS, DEFAULT_ORG_CAREER_FILTERS };
