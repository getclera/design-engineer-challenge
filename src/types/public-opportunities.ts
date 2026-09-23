import type { WorkplaceType } from "@clera/shared-types";
import type { schema } from "@/lib/db/drizzle";

export interface PublicCandidate {
	id: string;
	firstname?: string;
	lastname?: string;
	linkedin_url?: string;
	location?: string;
	avatar_url?: string;
	preferred_work_environment?: WorkplaceType[];
	roles?: string[];
	has_cv?: boolean;
	visa_sponsorship_needed?: boolean | null;
}

export interface PublicCandidateResponse {
	id: string;
	firstname: string | null;
	lastname: string | null;
	linkedinUrl: string | null;
	location: string | null;
	avatarUrl: string | null;
	preferredWorkEnvironment: string[] | null;
	roles: string[] | null;
	hasResume: boolean;
	visaSponsorshipNeeded: boolean | null;
	willingnessToRelocate: string[] | null;
}

export type InterviewStage = Pick<
	typeof schema.jobInterviewStagesInJobs.$inferSelect,
	"name" | "description" | "duration" | "priority"
>;

export interface OpportunityCompany {
	id: string;
	name: string | null;
	logo_url: string | null;
	industry: string | null;
	slug: string | null;
	website_url: string | null;
	description: string | null;
}

export interface JobLocationDetail {
	city: string | null;
	country: string | null;
	normalized: string | null;
	latitude: string | null;
	longitude: string | null;
}

export interface OpportunityJob {
	id: string;
	job_id?: string;
	position: string;
	status: string;
	description: string | null;
	workplace_type: string | null;
	job_type: string | null;
	tech_stack: string[] | null;
	roles: string[] | null;
	years_experience_min: number | null;
	years_experience_max: number | null;
	salary_lower_bound: number | null;
	salary_upper_bound: number | null;
	currency_type: string | null;
	equity: string | null;
	slug: string | null;
	visa_sponsorship_available: boolean | null;
	visa_text: string | null;
	visa_text_more: string | null;
	cities: string[];
	countries: string[];
	normalized_locations: string[];
	location_details?: JobLocationDetail[];
	company: OpportunityCompany;
	company_name: string | null;
	company_logo_url: string | null;
	company_industry?: string | null;
	company_slug?: string | null;
	company_website_url?: string | null;
	interview_stages: InterviewStage[];
	is_open_submission: boolean | null;
	landing_page: string | null;
	created_at?: string;
	_score: number;
	job_ratings: unknown | null;
	bonus_enabled?: boolean;
	bonus_amount?: number;
	bonus_currency?: string;
	bonus_type?: string;
	bonus_frequency?: string;
	role_names?: string[];
	role_cluster?: string[];
	company_size_clustered?: string[];
	company_last_funding_round?: string[];
}

export interface PublicOpportunity {
	id: number;
	created_at: string;
	job_id: string;
	talent_id: string;
	status: string;
	source: string | null;
	interest_talent: boolean | null;
	interest_talent_timestamp: string | null;
	interest_company: boolean | null;
	priority: number | null;
	job: OpportunityJob;
}

export interface SimilarJobWithDetails {
	job_id: string;
	position: string;
	status: string;
	salary_lower_bound: number | null;
	salary_upper_bound: number | null;
	currency_type: string | null;
	workplace_type: string | null;
	company_name: string | null;
	company_logo_url: string | null;
	cities: string[] | null;
	countries: string[] | null;
	similarity_score: number;
}

export interface InterestUpdatePayload {
	jobId: string;
	interest_talent: boolean | null;
}

export interface InterestUpdateResponse {
	success: boolean;
	similarJobs?: SimilarJobWithDetails[];
}

export interface LikedOpportunity {
	jobId: string;
	title: string;
	company_name: string;
}

export interface PublicOpportunitiesShellProps {
	candidateId: string;
	initialCandidate: PublicCandidate;
	initialOpportunities: PublicOpportunity[];
}
