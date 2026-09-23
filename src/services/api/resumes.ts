import type { ResumeInfo, ResumeListItem, ResumeListResponse } from "@app/api/resume/[talentId]/types";
import type { ResumeFeedback } from "@/types/resume";
import type { StructuredResumeData } from "@/utils/resumeUtils";
import { type ApiResult, callServiceApi, fetchApi } from "./client";

export type { ResumeListItem };

export interface ResumeDataResponse {
	success: boolean;
	cv: ResumeInfo;
	structured_data?: StructuredResumeData | null;
	parsing: {
		parse_triggered: boolean;
		parse_error: string | null;
	};
	error?: string;
	message?: string;
}

export interface PrimaryResumeResponse {
	found: boolean;
	resumeId: string | null;
	documentUrl: string | null;
	signedUrl: string | null;
	displayName: string | null;
	uploadedAt: string | null;
}

interface SetPrimaryResponse {
	success: boolean;
	error?: string;
}

interface DeleteResumeResponse {
	success: boolean;
	error?: string;
}

function getData(talentId: string, resumeId?: string): Promise<ApiResult<ResumeDataResponse>> {
	const url = resumeId ? `/api/resume/${talentId}?resumeId=${resumeId}` : `/api/resume/${talentId}`;
	return fetchApi<ResumeDataResponse>(url);
}

function getAll(talentId: string): Promise<ApiResult<ResumeListResponse>> {
	return fetchApi<ResumeListResponse>(`/api/resume/${talentId}?all=true`);
}

function getPrimary(talentId: string, orgId?: string): Promise<ApiResult<PrimaryResumeResponse>> {
	const search = orgId ? `?orgId=${orgId}` : "";
	return fetchApi<PrimaryResumeResponse>(`/api/talents/${talentId}/resume${search}`);
}

function setPrimary(talentId: string, resumeId: string): Promise<ApiResult<SetPrimaryResponse>> {
	return fetchApi<SetPrimaryResponse>(`/api/resume/${talentId}/primary`, {
		method: "PUT",
		body: JSON.stringify({ resumeId }),
	});
}

function remove(talentId: string, resumeId: string): Promise<ApiResult<DeleteResumeResponse>> {
	return fetchApi<DeleteResumeResponse>(`/api/resume/${talentId}/${resumeId}`, {
		method: "DELETE",
	});
}

interface ClearResumeResponse {
	success: boolean;
}

function clear(talentId: string): Promise<ApiResult<ClearResumeResponse>> {
	return fetchApi<ClearResumeResponse>(`/api/resume/${talentId}/clear`, {
		method: "DELETE",
	});
}

interface GenerateFeedbackRequest {
	aiInteractionId: string;
	breakCache?: boolean;
}

interface GenerateFeedbackResponse {
	success: boolean;
	feedback?: ResumeFeedback;
	cached?: boolean;
	runId?: string;
	publicAccessToken?: string;
	error?: string;
}

function generateFeedback(data: GenerateFeedbackRequest): Promise<ApiResult<GenerateFeedbackResponse>> {
	return fetchApi<GenerateFeedbackResponse>("/api/resume/feedback", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

interface GenerateFeedbackPublicRequest {
	resumePath: string;
}

interface StartFeedbackPublicResponse {
	success: boolean;
	runId: string | null;
	publicAccessToken?: string;
}

function startFeedbackPublic(data: GenerateFeedbackPublicRequest): Promise<ApiResult<StartFeedbackPublicResponse>> {
	return callServiceApi<StartFeedbackPublicResponse, GenerateFeedbackPublicRequest>(
		"/api/resume/feedback-public",
		data,
	);
}

export const resumes = {
	getData,
	getAll,
	getPrimary,
	setPrimary,
	remove,
	clear,
	generateFeedback,
	startFeedbackPublic,
};
