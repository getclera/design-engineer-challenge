import type { ReferralSource, SlackInviteStatus } from "@clera/shared-types";
import type { OnboardingRequirement } from "@/types/onboarding";
import { type ApiResult, callApi, fetchApi } from "./client";

interface OnboardingInitResponse {
	organizationId: string;
	companyId: string;
	isOnboarded: boolean;
	created: boolean;
	websiteUrl: string | null;
}

interface OnboardingInitRequest {
	referralSource?: ReferralSource;
}

function init(request: OnboardingInitRequest = {}): Promise<ApiResult<OnboardingInitResponse>> {
	return callApi<OnboardingInitResponse, OnboardingInitRequest>("/api/v2/onboarding/init", request);
}

interface UpdateCompanyRequest {
	name: string;
	websiteUrl: string;
	referralSource?: ReferralSource;
}

interface UpdateCompanyResponse {
	ok: true;
	companyId: string;
}

function updateCompany(request: UpdateCompanyRequest): Promise<ApiResult<UpdateCompanyResponse>> {
	return callApi<UpdateCompanyResponse, UpdateCompanyRequest>("/api/v2/onboarding/company", request);
}

interface CompanySearchResponse {
	success: boolean;
	data?: {
		name?: string;
		websiteUrl?: string;
		description?: string;
		logoUrl?: string;
		careersPageUrl?: string;
	};
}

function companySearch(request: { websiteUrl: string }): Promise<ApiResult<CompanySearchResponse>> {
	return callApi<CompanySearchResponse, typeof request>("/api/onboarding/company-search", request);
}

interface ImportJobsResponse<TJob = Record<string, unknown>> {
	success: boolean;
	importedJobs?: TJob[];
}

function importJobs<TJob = Record<string, unknown>>(request: {
	companyName: string;
	organizationId: string;
	careersPageUrl?: string;
}): Promise<ApiResult<ImportJobsResponse<TJob>>> {
	return callApi<ImportJobsResponse<TJob>, typeof request>("/api/onboarding/import-jobs", request);
}

interface GenerateRequirementsResponse {
	success: boolean;
	requirements: OnboardingRequirement[];
}

function generateRequirements(request: {
	jobTitle: string;
	companyName: string;
}): Promise<ApiResult<GenerateRequirementsResponse>> {
	return callApi<GenerateRequirementsResponse, typeof request>("/api/onboarding/generate-requirements", request);
}

function getState<T = Record<string, unknown>>(): Promise<ApiResult<{ state: T }>> {
	return fetchApi<{ state: T }>("/api/onboarding/state");
}

function updateState<T = Record<string, unknown>>(state: T): Promise<ApiResult<Record<string, unknown>>> {
	return callApi<Record<string, unknown>, T>("/api/onboarding/state", state, { method: "PUT" });
}

function deleteState(): Promise<ApiResult<Record<string, unknown>>> {
	return fetchApi<Record<string, unknown>>("/api/onboarding/state", { method: "DELETE" });
}

interface SetMemberRoleResponse {
	success: boolean;
}

function setMemberRole(): Promise<ApiResult<SetMemberRoleResponse>> {
	return callApi<SetMemberRoleResponse, Record<string, never>>("/api/onboarding/member-role", {});
}

interface SlackConnectResponse {
	success: boolean;
	channelName?: string;
	channelId?: string | null;
	inviteStatus?: SlackInviteStatus;
	inviteMessage?: string;
}

interface SlackConnectStatusResponse {
	connected: boolean;
	channelName: string | null;
	channelId: string | null;
	inviteMessage: string | null;
}

function slackConnectStatus(): Promise<ApiResult<SlackConnectStatusResponse>> {
	return fetchApi<SlackConnectStatusResponse>("/api/v2/onboarding/slack-connect");
}

function slackConnect(request: { userEmail: string }): Promise<ApiResult<SlackConnectResponse>> {
	return callApi<SlackConnectResponse, typeof request>("/api/v2/onboarding/slack-connect", request);
}

interface TermsStatusResponse {
	accepted: boolean;
}

function checkTerms(orgId: string): Promise<ApiResult<TermsStatusResponse>> {
	return fetchApi<TermsStatusResponse>(`/api/v2/onboarding/accept-terms?orgId=${orgId}`);
}

function acceptTerms(orgId: string): Promise<ApiResult<{ success: boolean }>> {
	return callApi<{ success: boolean }, { orgId: string }>("/api/v2/onboarding/accept-terms", { orgId });
}

export const onboardingApi = {
	init,
	updateCompany,
	companySearch,
	importJobs,
	generateRequirements,
	getState,
	updateState,
	deleteState,
	setMemberRole,
	slackConnectStatus,
	slackConnect,
	checkTerms,
	acceptTerms,
};
