import type {
	fitReasonWire,
	headerWire,
	opportunityCountsWire,
	responseTimeWire,
	unifiedTextWire,
} from "@app/api/_utils/talent-info-adapters";
import type { CoreUserProfileWire } from "@app/api/_utils/talent-info-core-wire";
import { adminTalentApiRoutes } from "@clera/route-factory";
import type { MobileChannel, WorkplaceType } from "@clera/shared-types";
import type { sourcingCommands } from "@edge-functions/sourcing-service/commands";
import type { talentCommands } from "@edge-functions/talent-service/commands";
import type { PreferencesDataOutputSchema } from "@edge-functions/talent-service/schemas-profile/preferences-data";
import type { z } from "zod";
import type { MatchmakingStartResponse } from "@/types/matchmaking";
import type { Skill } from "@/types/profileData";
import type { AppRole } from "@/types/user";
import { type ApiResult, buildQueryString, callApi, fetchApi } from "./client";

interface UpdatePriorityStarRequest {
	priorityStar: boolean;
}

interface UpdatePriorityStarResponse {
	success: boolean;
	priorityStar: boolean;
}

interface FetchLinkedInWhitelistResponse {
	whitelistStatus: boolean;
}

export interface CurrentUserInteractionResponse {
	id: string;
	nano_id: string;
	first_name: string | null;
	last_name: string | null;
	phone: string | null;
	years_experience: number | null;
	rating: number | null;
	elo_score: number | null;
	user_id: string | null;
	email: string | null;
	linkedin_url: string | null;
	cv_path: string | null;
	cv_filename: string | null;
	created_at: string;
	updated_at: string | null;
	source: string | null;
	avatar_url: string | null;
	skills: Skill[];
	connected_mobile_channels?: MobileChannel[];
	blocked_companies?: string[];
	occupation?: string | null;
	roles?: string[] | null;
	willingness_to_relocate?: string[];
	preferred_work_environment?: WorkplaceType[];
	preferred_company_funding_stage?: string[];
	preferred_work_geolocations?: { lat: number; lng: number; label: string; radius?: number }[];
	visa_sponsorship_needed?: boolean | null;
	visa_sponsorship_type?: string[];
	linkedin_country?: string | null;
	salary_lower_bound?: number | null;
	salary_upper_bound?: number | null;
	salary_currency?: string;
	open_for_opportunities?: boolean;
}

function updatePriorityStar(
	talentId: string,
	request: UpdatePriorityStarRequest,
): Promise<ApiResult<UpdatePriorityStarResponse>> {
	return callApi<UpdatePriorityStarResponse, UpdatePriorityStarRequest>(
		`/api/admin/talents/${talentId}/priority-star`,
		request,
		{ method: "PATCH" },
	);
}

function fetchLinkedInWhitelist(
	talentId: string,
	linkedinUrl: string | null,
): Promise<ApiResult<FetchLinkedInWhitelistResponse>> {
	const url = linkedinUrl
		? `/api/talents/${talentId}/linkedin-whitelist?linkedinUrl=${encodeURIComponent(linkedinUrl)}`
		: `/api/talents/${talentId}/linkedin-whitelist`;
	return fetchApi<FetchLinkedInWhitelistResponse>(url);
}

function fetchCurrentUserInteraction(): Promise<ApiResult<CurrentUserInteractionResponse | null>> {
	return fetchApi<CurrentUserInteractionResponse | null>("/api/talents/me");
}

interface UserInfo {
	id: string;
	role: AppRole;
	company_id?: string;
	landingpages?: string[];
}

interface TalentRatingSummary {
	rating_id: string;
	total_rating_score: number | null;
	job_id: string | null;
}

interface TalentOpportunityInterview {
	stage_number: number | null;
	stage_name: string | null;
	status: string | null;
	updated_at: string;
}

interface TalentOpportunitySummary {
	id: number;
	job_id: string | null;
	status: string | null;
	company: string | null;
	position: string | null;
	jd_url: string | null;
	interview: TalentOpportunityInterview | null;
}

interface TalentUtm {
	source: string | null;
	medium: string | null;
	campaign: string | null;
}

export interface TalentListItem {
	id: string;
	nano_id: string;
	firstname: string | null;
	lastname: string | null;
	avatar_url: string | null;
	linkedin_url: string | null;
	created_at: string;
	status: string | null;
	user_id: string | null;
	follow_up_needed: boolean | null;
	follow_up_date: string | null;
	follow_up_note: string | null;
	source: string | null;
	recruiter_id: string | null;
	location: string | null;
	talent_oneliner: string | null;
	utm: TalentUtm | null;
	ratings: TalentRatingSummary[];
	opportunities: TalentOpportunitySummary[];
}

interface TalentsListResponse {
	userInfo: UserInfo;
	talents: TalentListItem[];
}

interface UpdateStatusRequest {
	status: string;
}

interface UpdateStatusResponse {
	success: boolean;
	status: string;
}

function list(): Promise<ApiResult<TalentsListResponse>> {
	return fetchApi<TalentsListResponse>("/api/talents");
}

function updateStatus(talentId: string, request: UpdateStatusRequest): Promise<ApiResult<UpdateStatusResponse>> {
	return callApi<UpdateStatusResponse, UpdateStatusRequest>(`/api/talents/${talentId}/status`, request, {
		method: "PATCH",
	});
}

interface TalentRolesResponse {
	talentId: string;
	roleIds: string[];
	roles: Array<{ id: number; name: string; description: string | null }>;
}

interface UpdateTalentRolesRequest {
	roleIds: string[];
}

interface UpdateTalentRolesResponse {
	talentId: string;
	roleIds: string[];
}

function getTalentRoles(talentId: string): Promise<ApiResult<TalentRolesResponse>> {
	return fetchApi<TalentRolesResponse>(`/api/talents/${talentId}/roles`);
}

function updateTalentRoles(
	talentId: string,
	request: UpdateTalentRolesRequest,
): Promise<ApiResult<UpdateTalentRolesResponse>> {
	return callApi<UpdateTalentRolesResponse, UpdateTalentRolesRequest>(`/api/talents/${talentId}/roles`, request, {
		method: "PATCH",
	});
}

interface TalentSkill {
	name: string;
	skillLevel: string | null;
	skillExperienceYears: number | null;
}

interface TalentComment {
	id: string;
	comment: string | null;
	author: string | null;
	createdAt: string;
	deleted: boolean;
	updatedAt: string | null;
	taggedUsers: string[] | null;
	edited: boolean;
	talentId: string;
	profile: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		avatarUrl: string | null;
	} | null;
}

interface TalentOpportunity {
	id: number;
	talentId: string;
	jobId: string | null;
	status: string | null;
	interestTalent: boolean | null;
	createdAt: string;
	updatedAt: string | null;
	questionsCount: number;
	questionStatus: "No Questions" | "Answered" | "Partial" | "Pending";
}

type AIInteractionLog = z.infer<typeof talentCommands.profile.get_ai_logs.output>[number];

type PageVisitLog = z.infer<typeof talentCommands.profile.get_page_visits.output>[number];

function fetchAILogs(talentId: string): Promise<ApiResult<AIInteractionLog[]>> {
	return fetchApi<AIInteractionLog[]>(`/api/admin/talents/${talentId}/ai-logs`);
}

function fetchPageVisits(talentId: string): Promise<ApiResult<PageVisitLog[]>> {
	return fetchApi<PageVisitLog[]>(`/api/admin/talents/${talentId}/page-visits`);
}

function fetchEngagementPulse(talentId: string): Promise<ApiResult<EngagementPulse>> {
	return fetchApi<EngagementPulse>(adminTalentApiRoutes.engagementPulse(talentId));
}

function fetchParaformMarketStatus(talentId: string): Promise<ApiResult<ParaformMarketStatus>> {
	return fetchApi<ParaformMarketStatus>(adminTalentApiRoutes.paraformMarketStatus(talentId));
}

function fetchComments(talentId: string): Promise<ApiResult<TalentComment[]>> {
	return fetchApi<TalentComment[]>(`/api/talents/${talentId}/comments`);
}

function removeFollowUp(talentId: string): Promise<ApiResult<{ success: boolean }>> {
	return fetchApi<{ success: boolean }>(`/api/talents/${talentId}/follow-up`, { method: "DELETE" });
}

interface UniqueSourcesResponse {
	sources: string[];
}

function fetchUniqueSources(): Promise<ApiResult<UniqueSourcesResponse>> {
	return fetchApi<UniqueSourcesResponse>("/api/talents/unique-sources");
}

interface UniqueLocationsResponse {
	locations: string[];
}

function fetchUniqueLocations(): Promise<ApiResult<UniqueLocationsResponse>> {
	return fetchApi<UniqueLocationsResponse>("/api/talents/unique-locations");
}

interface OpportunityJobInfo {
	id: string;
	company: string | null;
	position: string;
}

interface OpportunityWithJob {
	id: number;
	talentId: string;
	jobId: string | null;
	status: string | null;
	createdAt: string | null;
	updatedAt: string | null;
	interestTalent: boolean | null;
	interestCompany: boolean | null;
	fee: string | null;
	salary: string | null;
	startDate: string | null;
	rejectSource: string | null;
	rejectReason: string | null;
	noFitCategory: string | null;
	source: string | null;
	job: OpportunityJobInfo | null;
}

interface OpportunitiesWithJobsResponse {
	opportunities: OpportunityWithJob[];
}

function fetchOpportunitiesWithJobs(talentId: string): Promise<ApiResult<OpportunitiesWithJobsResponse>> {
	return fetchApi<OpportunitiesWithJobsResponse>(`/api/talents/${talentId}/opportunities-with-jobs`);
}

interface TalentBasicInfo {
	id: string;
	firstname: string | null;
	lastname: string | null;
	email: string | null;
}

interface TalentBasicResponse {
	success: boolean;
	data: TalentBasicInfo | null;
}

function fetchBasic(talentId: string): Promise<ApiResult<TalentBasicResponse>> {
	return fetchApi<TalentBasicResponse>(`/api/admin/talents/${talentId}/basic`);
}

interface TaskRunningResponse {
	isRunning: boolean;
	runId: string | null;
}

function checkTaskRunning(talentId: string, runType: string): Promise<ApiResult<TaskRunningResponse>> {
	return fetchApi<TaskRunningResponse>(`/api/talents/${talentId}/task-running?runType=${encodeURIComponent(runType)}`);
}

interface TalentTag {
	id: number;
	tag: string;
	category: string | null;
}

interface TalentTagsResponse {
	success: boolean;
	tags: TalentTag[];
}

function fetchTags(talentId: string): Promise<ApiResult<TalentTagsResponse>> {
	return fetchApi<TalentTagsResponse>(`/api/admin/talents/${talentId}/tags`);
}

interface UpdateSourceRequest {
	source: string;
}

interface UpdateSourceResponse {
	success: boolean;
	source: string;
}

function updateSource(talentId: string, request: UpdateSourceRequest): Promise<ApiResult<UpdateSourceResponse>> {
	return callApi<UpdateSourceResponse, UpdateSourceRequest>(`/api/talents/${talentId}/source`, request, {
		method: "PUT",
	});
}

interface GetTalentNameResponse {
	success: boolean;
	data?: {
		firstName: string | null;
		lastName: string | null;
		fullName: string;
	};
	error?: string;
}

function getName(talentId: string): Promise<ApiResult<GetTalentNameResponse>> {
	return fetchApi<GetTalentNameResponse>(`/api/talents/${talentId}/name`);
}

interface TalentEnrichmentLog {
	created_at: string;
	talent_id: string;
	processing_id: string | null;
	trigger: string | null;
	source: string | null;
	enrichment_type: string | null;
	input_data: unknown;
	output_data: unknown;
}

function fetchEnrichmentLogs(talentId: string): Promise<ApiResult<TalentEnrichmentLog[]>> {
	return fetchApi<TalentEnrichmentLog[]>(`/api/admin/talents/${talentId}/enrichment`);
}

function enrichPhone(talentId: string): Promise<ApiResult<{ success: boolean }>> {
	return callApi<{ success: boolean }>(`/api/admin/talents/${talentId}/enrich-phone`, {});
}

export interface TalentProfileBundleResponse {
	aiData: Record<string, unknown>;
	opportunities: TalentOpportunity[];
	comments: TalentComment[];
	talentSkills: TalentSkill[];
	userProfile: CoreUserProfileWire | null;
	linkedInData: Record<string, unknown>;
	ratings: Array<{
		id: number;
		job_id: string | null;
		talent_id: string;
		created_at: string;
		requirements_score: number | null;
		requirements_missing_info: string[] | null;
		requirements_details: unknown[];
		job?: {
			id: string;
			position: string;
			company_name?: string;
		};
	}>;
	linkedinWhitelistStatus: boolean;
	roles: Array<{ id: number; name: string }>;
	tags: Array<{ id: number; tag: string; category: string }>;
	opportunityCount?: number;
	communicationCounts?: {
		emails: number;
		linkedin: number;
		chats: number;
		webChat?: number;
		totalCount: number;
	};
}

function fetchProfileCore(talentId: string): Promise<ApiResult<TalentProfileBundleResponse>> {
	return fetchApi<TalentProfileBundleResponse>(`/api/talents/${talentId}/profile-core`);
}

interface AgentMemoryUpdate {
	key: string;
	value: string | null;
}

interface UpdateAgentMemoryRequest {
	updates: AgentMemoryUpdate[];
}

interface UpdateAgentMemoryResponse {
	success: boolean;
	entriesUpdated: number;
	entriesDeleted: number;
	totalEntries: number;
}

function updateAgentMemory(
	talentId: string,
	request: UpdateAgentMemoryRequest,
): Promise<ApiResult<UpdateAgentMemoryResponse>> {
	return callApi<UpdateAgentMemoryResponse, UpdateAgentMemoryRequest>(
		`/api/admin/talents/${talentId}/agent-memory`,
		request,
		{ method: "PATCH" },
	);
}

interface BackfillConversationsRequest {
	talentId: string;
	publicIdentifier: string;
}

interface BackfillConversationsResponse {
	success: true;
	taskId: string;
}

function backfillConversations(
	request: BackfillConversationsRequest,
): Promise<ApiResult<BackfillConversationsResponse>> {
	return callApi<BackfillConversationsResponse, BackfillConversationsRequest>(
		"/api/talents/me/backfill-conversations",
		request,
	);
}

export type CloseTalentResult = z.infer<typeof talentCommands.profile.close_talent.output>;
export type EngagementPulse = z.infer<typeof talentCommands.activity.get_engagement_pulse.output>;
export type ParaformMarketStatus = z.infer<typeof sourcingCommands.paraform.get_market_status.output>;
export type CloseTalentInput = Omit<z.input<typeof talentCommands.profile.close_talent.input>, "talentId" | "actorId">;

function closeTalent(talentId: string, input: CloseTalentInput): Promise<ApiResult<CloseTalentResult>> {
	return callApi<CloseTalentResult, CloseTalentInput>(adminTalentApiRoutes.close(talentId), input);
}

function startMatchmaking(params: {
	talentId: string;
	source?: string;
	jobId?: string;
	breakCache?: boolean;
}): Promise<ApiResult<MatchmakingStartResponse>> {
	return callApi<MatchmakingStartResponse, typeof params>("/api/admin/talents/matchmaking/start", params);
}

function startRecruiterMatchmaking(
	talentId: string,
	source = "recruiter-add-candidate",
): Promise<ApiResult<MatchmakingStartResponse>> {
	return callApi<MatchmakingStartResponse, { source: string }>(`/api/talents/${talentId}/matchmaking/start`, {
		source,
	});
}

function updateOwner(talentId: string, data: { owner: string | null }): Promise<ApiResult<Record<string, unknown>>> {
	return callApi<Record<string, unknown>, typeof data>(`/api/talents/${talentId}/owner`, data, {
		method: "PATCH",
	});
}

function fetchBasicInfo<T>(talentId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/admin/talents/${talentId}/basic`);
}

function updateBasicInfo<T>(talentId: string, data: Record<string, unknown>): Promise<ApiResult<T>> {
	return callApi<T, Record<string, unknown>>(`/api/admin/talents/${talentId}/basic`, data, { method: "PATCH" });
}

function scheduleFollowUp<T>(talentId: string, data: Record<string, unknown>): Promise<ApiResult<T>> {
	return callApi<T, Record<string, unknown>>(`/api/admin/talents/${talentId}/follow-up`, data, {
		method: "PATCH",
	});
}

function cancelScheduledFollowUp(talentId: string, followUpId: number): Promise<ApiResult<{ success: boolean }>> {
	return callApi<{ success: boolean }, Record<string, never>>(
		`/api/admin/talents/${talentId}/follow-ups/${followUpId}/cancel`,
		{},
		{ method: "POST" },
	);
}

export type TalentHeaderData = ProfileBundleV2["header"];

function fetchHeaderData(talentId: string): Promise<ApiResult<TalentHeaderData>> {
	return fetchApi<TalentHeaderData>(`/api/admin/talents/${talentId}/header`);
}

type OpportunityCounts = ProfileBundleV2["opportunityCounts"];

function fetchOpportunityCounts(talentId: string): Promise<ApiResult<OpportunityCounts>> {
	return fetchApi<OpportunityCounts>(`/api/admin/talents/${talentId}/opportunity-counts`);
}

export interface UpdateFollowUpRequest {
	followUpDate: string | null;
	followUpNote: string | null;
}

function updateFollowUp(talentId: string, request: UpdateFollowUpRequest): Promise<ApiResult<{ success: boolean }>> {
	return callApi<{ success: boolean }, UpdateFollowUpRequest>(`/api/admin/talents/${talentId}/follow-up`, request, {
		method: "PATCH",
	});
}

export type PreferencesData = z.infer<typeof PreferencesDataOutputSchema>;

type ProfileBundleV2 = {
	header: ReturnType<typeof headerWire>;
	preferences: PreferencesData;
	opportunityCounts: ReturnType<typeof opportunityCountsWire>;
	fitReason: ReturnType<typeof fitReasonWire>;
	responseTime: ReturnType<typeof responseTimeWire>;
};

function fetchPreferencesData(talentId: string): Promise<ApiResult<PreferencesData>> {
	return fetchApi<PreferencesData>(`/api/admin/talents/${talentId}/preferences-data`);
}

export type MergedProfile = z.infer<typeof talentCommands.talent_info.get_profile.output>;

type UnifiedTextResponse = ReturnType<typeof unifiedTextWire>;

function fetchMergedProfile(talentId: string): Promise<ApiResult<MergedProfile>> {
	return fetchApi<MergedProfile>(`/api/admin/talents/${talentId}/merged-profile`);
}

function fetchUnifiedText(talentId: string): Promise<ApiResult<UnifiedTextResponse>> {
	return fetchApi<UnifiedTextResponse>(`/api/admin/talents/${talentId}/unified-text`);
}

interface FitReasonData {
	headline: string | null;
	reason: string | null;
	jobId: string | null;
	jobTitle: string | null;
	companyName: string | null;
}

function fetchFitReason(talentId: string, jobId?: string | null): Promise<ApiResult<FitReasonData>> {
	const params = jobId ? `?jobId=${jobId}` : "";
	return fetchApi<FitReasonData>(`/api/admin/talents/${talentId}/fit-reason${params}`);
}

interface ResponseTimeData {
	medianHours: number | null;
	sampleSize: number;
}

function fetchResponseTime(talentId: string): Promise<ApiResult<ResponseTimeData>> {
	return fetchApi<ResponseTimeData>(`/api/admin/talents/${talentId}/response-time`);
}

function fetchProfileBundleV2(talentId: string, jobId?: string | null): Promise<ApiResult<ProfileBundleV2>> {
	const params = jobId ? `?jobId=${jobId}` : "";
	return fetchApi<ProfileBundleV2>(`/api/admin/talents/${talentId}/profile-bundle${params}`);
}

export type TalentState = z.infer<typeof talentCommands.state.get.output>;
export type TalentStateAssertionPage = z.infer<typeof talentCommands.state.list_assertions.output>;
export type TalentStateAssertion = TalentStateAssertionPage["data"][number];
type CreateTalentStateAssertionResult = z.infer<typeof talentCommands.state.create_assertion.output>;
type RetractTalentStateAssertionResult = z.infer<typeof talentCommands.state.retract_assertion.output>;

export type CreateTalentStateAssertionInput = Omit<
	z.input<typeof talentCommands.state.create_assertion.input>,
	"talentId" | "source" | "actorId" | "evidenceKind" | "confidence" | "sourceMessage"
>;

export type RetractTalentStateAssertionInput = Omit<
	z.input<typeof talentCommands.state.retract_assertion.input>,
	"talentId" | "source" | "actorId"
>;

type RetractTalentStateAssertionBody = Omit<RetractTalentStateAssertionInput, "assertionId">;

export type ListTalentStateAssertionsParams = Omit<
	z.input<typeof talentCommands.state.list_assertions.input>,
	"talentId"
>;

function fetchState(talentId: string): Promise<ApiResult<TalentState>> {
	return fetchApi<TalentState>(adminTalentApiRoutes.state(talentId));
}

function createStateAssertion(
	talentId: string,
	input: CreateTalentStateAssertionInput,
): Promise<ApiResult<CreateTalentStateAssertionResult>> {
	return callApi<CreateTalentStateAssertionResult, CreateTalentStateAssertionInput>(
		adminTalentApiRoutes.state(talentId),
		input,
	);
}

function fetchStateAssertions(
	talentId: string,
	params: ListTalentStateAssertionsParams = {},
): Promise<ApiResult<TalentStateAssertionPage>> {
	const query = buildQueryString({
		axis: params.axis,
		conductSubject: params.conductSubject,
		verdictKind: params.verdictKind,
		includeRetracted: params.includeRetracted,
		limit: params.limit,
		cursor: params.cursor ?? undefined,
	});
	const path = adminTalentApiRoutes.stateAssertions(talentId);
	return fetchApi<TalentStateAssertionPage>(query ? `${path}?${query}` : path);
}

function retractStateAssertion(
	talentId: string,
	{ assertionId, ...body }: RetractTalentStateAssertionInput,
): Promise<ApiResult<RetractTalentStateAssertionResult>> {
	return callApi<RetractTalentStateAssertionResult, RetractTalentStateAssertionBody>(
		adminTalentApiRoutes.stateAssertionRetract(talentId, assertionId),
		body,
	);
}

export const talents = {
	createStateAssertion,
	fetchState,
	fetchStateAssertions,
	retractStateAssertion,
	fetchFitReason,
	fetchHeaderData,
	fetchMergedProfile,
	fetchOpportunityCounts,
	fetchPreferencesData,
	fetchProfileBundleV2,
	fetchResponseTime,
	fetchUnifiedText,
	updateFollowUp,
	startMatchmaking,
	startRecruiterMatchmaking,
	updatePriorityStar,
	fetchLinkedInWhitelist,
	fetchCurrentUserInteraction,
	list,
	updateStatus,
	getTalentRoles,
	updateTalentRoles,
	fetchBasic,
	fetchAILogs,
	fetchPageVisits,
	fetchEngagementPulse,
	fetchParaformMarketStatus,
	fetchComments,
	removeFollowUp,
	fetchUniqueSources,
	fetchUniqueLocations,
	fetchOpportunitiesWithJobs,
	checkTaskRunning,
	fetchTags,
	updateSource,
	getName,
	fetchProfileCore,
	enrichPhone,
	fetchEnrichmentLogs,
	updateAgentMemory,
	backfillConversations,
	closeTalent,
	updateOwner,
	fetchBasicInfo,
	updateBasicInfo,
	scheduleFollowUp,
	cancelScheduledFollowUp,
};
