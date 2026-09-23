import type { schema } from "@/lib/db/drizzle";
import { type ApiResult, callApi, fetchApi } from "./client";

interface EnrichTagsResponse {
	tags: string[];
	tagIds: number[];
	error: string | null;
	retryScheduled?: boolean;
}

function enrichTags(request: { talentId: string; breakCache?: boolean }): Promise<ApiResult<EnrichTagsResponse>> {
	return callApi<EnrichTagsResponse, typeof request>("/api/admin/talents/scoring/enrich-tags", request);
}

interface ClassifyRolesResponse {
	success: boolean;
	roles?: string[];
	error?: string | null;
	retryScheduled?: boolean;
}

function classifyRoles(request: { talentId: string; breakCache?: boolean }): Promise<ApiResult<ClassifyRolesResponse>> {
	return callApi<ClassifyRolesResponse, typeof request>("/api/admin/talents/enrichment/classify-roles", request);
}

interface CalculateExperienceYearsResponse {
	success: boolean;
	message?: string;
	talentId?: string;
	processing_status?: string;
	error?: string;
}

function calculateExperienceYears(request: {
	talentId: string;
	breakCache?: boolean;
}): Promise<ApiResult<CalculateExperienceYearsResponse>> {
	return callApi<CalculateExperienceYearsResponse, typeof request>(
		"/api/admin/talents/enrichment/calculate-experience-years",
		request,
	);
}

type YoeRun = typeof schema.aiInteractionYoeRunHistory.$inferSelect;

interface GetYoeHistoryResponse {
	runs: YoeRun[];
}

function getYoeHistory(talentId: string): Promise<ApiResult<GetYoeHistoryResponse>> {
	return fetchApi<GetYoeHistoryResponse>(
		`/api/admin/talents/enrichment/yoe-history?talentId=${encodeURIComponent(talentId)}`,
	);
}

interface UpdateYearsExperienceResponse {
	success: boolean;
}

function updateYearsExperience(request: {
	talentId: string;
	totalYears: number;
	reasoningText?: string | null;
	source?: "ai_calculated" | "manual_override";
}): Promise<ApiResult<UpdateYearsExperienceResponse>> {
	return callApi<UpdateYearsExperienceResponse, typeof request>(
		"/api/admin/talents/enrichment/years-experience",
		request,
		{ method: "PATCH" },
	);
}

export const talentEnrichment = {
	enrichTags,
	classifyRoles,
	calculateExperienceYears,
	getYoeHistory,
	updateYearsExperience,
};
