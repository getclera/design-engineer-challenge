import type { jobCommands } from "@edge-functions/job-service/commands";
import type { ActiveNumbers } from "@v2/utils/channel-urls";
import type { z } from "zod";
import type { PublicJob } from "@/types/public-job";
import type { InterestUpdatePayload, InterestUpdateResponse, PublicOpportunity } from "@/types/public-opportunities";
import { type ApiResult, callApi, fetchApi } from "./client";

interface PublicCandidateResponse {
	id: string;
	firstname: string | null;
	lastname: string | null;
	linkedinUrl: string | null;
	location: string | null;
	avatarUrl: string | null;
	preferredWorkEnvironment: string[] | null;
	roles: string[] | null;
}

export interface ReferrerData {
	id: string;
	firstname: string;
	lastname: string;
	avatar_url: string | null;
	linkedin_url: string | null;
	occupation: string | null;
	rating: number | null;
}

interface ReferrerResponse {
	success: boolean;
	referrer: ReferrerData;
}

function getCandidate(talentId: string): Promise<ApiResult<PublicCandidateResponse>> {
	return fetchApi<PublicCandidateResponse>(`/api/public/talents/${talentId}`);
}

function getReferrer(slug: string): Promise<ApiResult<ReferrerResponse>> {
	return fetchApi<ReferrerResponse>(`/api/public/referrer?slug=${encodeURIComponent(slug)}`);
}

function getOpportunities(talentId: string): Promise<ApiResult<PublicOpportunity[]>> {
	return fetchApi<PublicOpportunity[]>(`/api/public/opportunities/${talentId}`);
}

function updateInterest(talentId: string, payload: InterestUpdatePayload): Promise<ApiResult<InterestUpdateResponse>> {
	return callApi<InterestUpdateResponse>(`/api/public/opportunities/${talentId}/interest`, payload);
}

interface CountResponse {
	count: number;
}

function getTalentCount(): Promise<ApiResult<CountResponse>> {
	return fetchApi<CountResponse>("/api/public/talent-count");
}

function getCompanyCount(): Promise<ApiResult<CountResponse>> {
	return fetchApi<CountResponse>("/api/public/company-count");
}

function getPublicJobs(): Promise<ApiResult<{ data: PublicJob[]; count: number }>> {
	return fetchApi<{ data: PublicJob[]; count: number }>("/api/jobs/public");
}

function savePreferences(
	talentId: string,
	preferences: Record<string, unknown>,
): Promise<ApiResult<{ success: boolean }>> {
	return callApi<{ success: boolean }>(`/api/public/opportunities/${talentId}/preferences`, {
		preferences,
	});
}

type SearchFiltersResponse = z.infer<typeof jobCommands.search.get_public_filters.output>;

function fetchSearchFilters(audience: "public" | "talent" = "public"): Promise<ApiResult<SearchFiltersResponse>> {
	return fetchApi<SearchFiltersResponse>(`/api/public/search-filters?audience=${audience}`);
}

interface CreateUserRequest {
	email: string;
	firstName?: string | null;
	lastName?: string | null;
	interactionId?: string;
	linkedinUrl?: string | null;
	avatarUrl?: string | null;
	resumePath?: string | null;
	skipWaitlistEmail?: boolean;
}

interface CreateUserResponse {
	success: boolean;
	isExisting?: boolean;
	user?: { id: string };
	session?: { access_token: string; refresh_token: string };
	error?: string;
}

function createUser(request: CreateUserRequest): Promise<ApiResult<CreateUserResponse>> {
	return callApi<CreateUserResponse, CreateUserRequest>("/api/public/users", request);
}

interface UserExistsResponse {
	exists: boolean;
	hasPendingOrgInvitation?: boolean;
}

function checkUserExists(email: string): Promise<ApiResult<UserExistsResponse>> {
	return callApi<UserExistsResponse, { email: string }>("/api/public/users/exists", { email });
}

interface ReferralSubmitRequest {
	email?: string;
	linkedinUrl?: string;
	referredBy?: string;
	source?: string;
	sourceName?: string;
}

interface ReferralSubmitResponse {
	duplicate?: boolean;
	action?: "created" | "updated";
	ai_interaction_id?: string;
	firstname?: string;
	lastname?: string;
}

function submitReferral(request: ReferralSubmitRequest): Promise<ApiResult<ReferralSubmitResponse>> {
	return callApi<ReferralSubmitResponse, ReferralSubmitRequest>("/api/public/referral/submit", request);
}

interface RecruitingPartnerSubmitRequest {
	candidateName: string;
	candidateLinkedinUrl: string;
	candidateRole?: string;
	candidateLocation?: string;
	partnerName: string;
	partnerEmail: string;
	partnerAgency?: string;
}

interface RecruitingPartnerSubmitResponse {
	success: boolean;
}

function submitRecruitingPartnerCandidate(
	request: RecruitingPartnerSubmitRequest,
): Promise<ApiResult<RecruitingPartnerSubmitResponse>> {
	return callApi<RecruitingPartnerSubmitResponse, RecruitingPartnerSubmitRequest>(
		"/api/public/recruiting-partner/submit-talent",
		request,
	);
}

export { savePreferences };

function getCompany<T>(companySlug: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/public/companies/${encodeURIComponent(companySlug)}`);
}

function getSimilarJobs<T>(jobId: string, limit = 3): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/public/jobs/similar?jobId=${jobId}&limit=${limit}`);
}

function getActiveNumbers(): Promise<ApiResult<ActiveNumbers>> {
	return fetchApi<ActiveNumbers>("/api/public/active-numbers");
}

interface SaveAnswerPublicParams {
	talentId: string;
	questionId: string | number;
	answer?: string;
	status?: "empty" | "draft" | "submitted";
}

function saveAnswerPublic(params: SaveAnswerPublicParams): Promise<ApiResult<{ success: boolean }>> {
	const { talentId, ...body } = params;
	return callApi<{ success: boolean }>(`/api/public/opportunities/${encodeURIComponent(talentId)}/answers`, body);
}

interface GenerateAiAnswersPublicParams {
	talentId: string;
	opportunityId: number | string;
	questionId?: string;
	existingNotes?: string;
	breakCache?: boolean;
}

interface GenerateAiAnswersPublicResponse {
	answers: Array<{
		question_id: string;
		question: string;
		answer: string | null;
		confidence: "high" | "medium" | "low" | "skip";
	}>;
	message: string;
	stats?: {
		total_questions: number;
		high_confidence: number;
		medium_confidence: number;
		low_confidence: number;
		skipped: number;
	};
	autoSubmitted?: boolean;
	questionsNeedingInput?: Array<{
		question_id: string;
		question: string;
		confidence: "skip";
	}>;
}

function generateAiAnswersPublic(
	params: GenerateAiAnswersPublicParams,
): Promise<ApiResult<GenerateAiAnswersPublicResponse>> {
	const { talentId, ...body } = params;
	return callApi<GenerateAiAnswersPublicResponse>(
		`/api/public/opportunities/${encodeURIComponent(talentId)}/generate-answers`,
		body,
	);
}

interface CandidateRolesResponse {
	aiInteractionId: string;
	roleIds: string[];
	roles: Array<{ id: number; name: string; description: string | null }>;
}

function getCandidateRoles(talentId: string): Promise<ApiResult<CandidateRolesResponse>> {
	return fetchApi<CandidateRolesResponse>(`/api/public/opportunities/${encodeURIComponent(talentId)}/roles`);
}

export const publicApi = {
	getCandidate,
	getReferrer,
	getOpportunities,
	updateInterest,
	getTalentCount,
	getCompanyCount,
	getPublicJobs,
	savePreferences,
	fetchSearchFilters,
	createUser,
	checkUserExists,
	submitReferral,
	submitRecruitingPartnerCandidate,
	getCompany,
	getSimilarJobs,
	getActiveNumbers,
	saveAnswerPublic,
	generateAiAnswersPublic,
	getCandidateRoles,
};
