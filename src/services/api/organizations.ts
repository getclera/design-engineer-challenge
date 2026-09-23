import type { ExternalTalentFilters, OrgFeedbackReason, OrgUsageMetric, SlackInviteStatus } from "@clera/shared-types";
import type { communicationCommands } from "@edge-functions/communication-service/commands";
import type { organizationCommands } from "@edge-functions/organization-service/commands";
import type { TalentServiceDirect } from "@edge-functions/talent-service/service";
import type { TalentEntityChip } from "@v2/components/data-display";
import type { SearchSessionItem } from "@v2/features/org-searches/types";
import type { z } from "zod";
import logger from "@/utils/logger";
import { type ApiResult, buildQueryString, callApi, fetchApi } from "./client";
import type { DropContactInput } from "./org-talents";
import { user as userApi } from "./user";

interface CreateOrganizationRequest {
	name: string;
	websiteUrl?: string;
	description?: string;
	logoUrl?: string;
}

interface CreateOrganizationResponse {
	organization: { id: string; name: string };
}

import type { JobStageDefinition, OpportunityTrackerData } from "@/types/interviewTracker";

interface InterviewTrackerResponse {
	opportunities: OpportunityTrackerData[];
	reviewKeys: string[];
	jobStages: Record<string, JobStageDefinition[]>;
}

interface SearchesListResponse {
	items: SearchSessionItem[];
	totalCount: number;
}

interface SearchStatusResponse {
	success: boolean;
	status: string;
	jobId: string;
	currentBatch: Array<{
		id: string;
		fullName: string;
		email: string | null;
		location: string | null;
		headline: string | null;
		avatarUrl: string | null;
		opportunityStatus: string | null;
		requirementsScore: number | null;
	}>;
	progress: {
		totalEvaluated: number;
		totalMatches: number;
	};
}

interface DashboardListResponse<T> {
	items: T[];
	totalCount: number;
	truncated?: boolean;
	counts?: {
		all: number;
		intro_request: number;
		role_specific: number;
		weekly_drop: number;
		public_drop: number;
	};
	byRole?: Record<string, RoleReviewCounts>;
	pausedPending?: Record<string, number>;
}

interface DashboardActionRequest {
	opportunityId: number;
	action: "request_intro" | "pass";
	rejectReason?: string;
	noFitCategory?: string;
	interestCompanyReason?: string;
	interestCompanyCategory?: string;
	enforceContactGate?: boolean;
	newContact?: DropContactInput;
	dropId?: string;
}

interface DashboardActionByTalentJobRequest {
	talentId: string;
	jobId: string;
	action: "request_intro" | "pass";
	rejectReason?: string;
	noFitCategory?: string;
	noFitCategories?: string[];
	interestCompanyReason?: string;
	interestCompanyCategory?: string;
	origin?: "company_dashboard" | "similar_picks";
	similarAnchorTalentId?: string;
}

interface UpdateRoleRequirementsRequest {
	requirements: unknown[];
}

function create(data: CreateOrganizationRequest): Promise<ApiResult<CreateOrganizationResponse>> {
	return callApi<CreateOrganizationResponse, CreateOrganizationRequest>("/api/organizations", data);
}

type AtsIntegrationRequest = z.infer<typeof organizationCommands.company.get_ats_integration_request.output>;
type RequestAtsIntegrationInput = { atsName?: string };
type RequestAtsIntegrationResult = z.infer<typeof organizationCommands.company.request_ats_integration.output>;

function requestAtsIntegration(
	orgId: string,
	data: RequestAtsIntegrationInput,
): Promise<ApiResult<RequestAtsIntegrationResult>> {
	return callApi<RequestAtsIntegrationResult, RequestAtsIntegrationInput>(
		`/api/organizations/${orgId}/ats-integration-request`,
		data,
		{ method: "POST" },
	);
}

function getAtsIntegrationRequest(orgId: string): Promise<ApiResult<AtsIntegrationRequest>> {
	return fetchApi<AtsIntegrationRequest>(`/api/organizations/${orgId}/ats-integration-request`);
}

type SlackConnection = {
	connected: boolean;
	channelName: string | null;
	channelId?: string | null;
	inviteStatus?: SlackInviteStatus;
	inviteMessage?: string;
	inviteLink?: string | null;
};

function getSlackConnection(orgId: string): Promise<ApiResult<SlackConnection>> {
	return fetchApi<SlackConnection>(`/api/organizations/${orgId}/slack-connection`);
}

function connectSlack(orgId: string, data: { userEmail: string }): Promise<ApiResult<SlackConnection>> {
	return callApi<SlackConnection, { userEmail: string }>(`/api/organizations/${orgId}/slack-connection`, data, {
		method: "POST",
	});
}

type DeliveryChannels = z.infer<typeof communicationCommands.company.get_preferred_channels.output>;
type DeliveryChannel = DeliveryChannels["channels"][number];
type DeliveryPreference = Omit<
	z.infer<typeof communicationCommands.company.set_preferred_channels.input>,
	"companyId" | "by"
>;

function getDeliveryChannels(orgId: string): Promise<ApiResult<DeliveryChannels>> {
	return fetchApi<DeliveryChannels>(`/api/organizations/${orgId}/delivery-channels`);
}

function setDeliveryChannels(orgId: string, data: DeliveryPreference): Promise<ApiResult<unknown>> {
	return callApi<unknown, DeliveryPreference>(`/api/organizations/${orgId}/delivery-channels`, data, {
		method: "PUT",
	});
}

function addDeliveryEmail(orgId: string, data: { channelIdentifier: string }): Promise<ApiResult<unknown>> {
	return callApi<unknown, { channelIdentifier: string }>(`/api/organizations/${orgId}/delivery-channels`, data, {
		method: "POST",
	});
}

interface AtsConnectionState {
	enabled: boolean;
	connection: {
		integrationSlug: string;
		integrationName: string;
		needsAttention: boolean;
		attentionReason: string | null;
		lastSyncedAt: string | null;
		syncedJobCount: number;
	} | null;
}

function getAtsConnection(orgId: string): Promise<ApiResult<AtsConnectionState>> {
	return fetchApi<AtsConnectionState>(`/api/organizations/${orgId}/ats-connections`);
}

function createAtsLinkToken(orgId: string, integrationSlug?: string): Promise<ApiResult<{ linkToken: string }>> {
	return callApi<{ linkToken: string }, { integrationSlug?: string }>(
		`/api/organizations/${orgId}/ats-connections/link-tokens`,
		{ integrationSlug },
		{ method: "POST" },
	);
}

function completeAtsConnection(orgId: string, publicToken: string): Promise<ApiResult<{ integrationName: string }>> {
	return callApi<{ integrationName: string }, { publicToken: string }>(
		`/api/organizations/${orgId}/ats-connections`,
		{ publicToken },
		{ method: "POST" },
	);
}

function disconnectAts(orgId: string): Promise<ApiResult<{ success: true }>> {
	return callApi<{ success: true }, Record<string, never>>(
		`/api/organizations/${orgId}/ats-connections`,
		{},
		{ method: "DELETE" },
	);
}

interface AtsRemoteRole {
	remoteJobId: string;
	title: string;
	jobUrl: string | null;
	isLinked: boolean;
	matchedJobId: string | null;
	matchedRoleTitle: string | null;
}

interface AtsRemoteRoles {
	syncPending: boolean;
	jobs: AtsRemoteRole[];
}

function getAtsRemoteRoles(orgId: string): Promise<ApiResult<AtsRemoteRoles>> {
	return fetchApi<AtsRemoteRoles>(`/api/organizations/${orgId}/ats-connections/roles`);
}

interface AtsImportSelection {
	remoteJobId: string;
	linkToJobId: string | null;
}

interface AtsImportResult {
	success: boolean;
	syncPending: boolean;
	message: string;
	total: number;
	runId: string | null;
}

function importAtsJobs(orgId: string, selections: AtsImportSelection[]): Promise<ApiResult<AtsImportResult>> {
	return callApi<AtsImportResult, { selections: AtsImportSelection[] }>(
		`/api/organizations/${orgId}/ats-connections/imports`,
		{ selections },
		{ method: "POST" },
	);
}

type OrgTalentSearchInput = z.input<typeof organizationCommands.talent_profile.search.input>;

function searchOrgTalents<T, F = unknown>(
	orgId: string,
	data: {
		filters: F;
		sort?: { field: string; direction?: "asc" | "desc" };
		page: number;
		per_page: number;
		jobId?: OrgTalentSearchInput["jobId"];
		profile?: OrgTalentSearchInput["profile"];
	},
): Promise<ApiResult<T>> {
	return callApi<T, typeof data>(`/api/organizations/${orgId}/talent-search`, data, { method: "POST" });
}

type OrgFacetSuggestField = Parameters<
	typeof TalentServiceDirect.search.list_organization_facet_suggestions
>[0]["field"];

function suggestOrgTalentFacets<T>(
	orgId: string,
	data: {
		field: OrgFacetSuggestField;
		query: string;
		limit?: number;
	},
): Promise<ApiResult<T>> {
	return callApi<T, typeof data>(`/api/organizations/${orgId}/talent-search/facet-suggest`, data, {
		method: "POST",
	});
}

function getOrgTalentFacets<T>(orgId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/talent-search/filters`);
}

function runExternalTalentSearch<T>(orgId: string, filters: ExternalTalentFilters): Promise<ApiResult<T>> {
	return callApi<T, { filters: ExternalTalentFilters }>(
		`/api/organizations/${orgId}/external-searches`,
		{ filters },
		{ method: "POST" },
	);
}

function listExternalTalentSearches<T>(orgId: string, cursor?: string): Promise<ApiResult<T>> {
	const search = buildQueryString({ cursor });
	return fetchApi<T>(`/api/organizations/${orgId}/external-searches${search ? `?${search}` : ""}`);
}

function getExternalTalentSearch<T>(orgId: string, searchId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/external-searches/${searchId}`);
}

function getExternalTalentFilterOptions<T>(
	orgId: string,
	params: { field?: string; query?: string; topK?: number } = {},
): Promise<ApiResult<T>> {
	const search = buildQueryString({ field: params.field, query: params.query, topK: params.topK });
	return fetchApi<T>(`/api/organizations/${orgId}/external-searches/filter-options${search ? `?${search}` : ""}`);
}

function createContactLookup<T>(orgId: string, linkedinUrl: string): Promise<ApiResult<T>> {
	return callApi<T, { linkedinUrl: string }>(
		`/api/organizations/${orgId}/contact-lookups`,
		{ linkedinUrl },
		{ method: "POST" },
	);
}

function listContactLookups<T>(orgId: string, cursor?: string): Promise<ApiResult<T>> {
	const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
	return fetchApi<T>(`/api/organizations/${orgId}/contact-lookups${query}`);
}

function getOrgDailyUsage<T>(orgId: string, metric: OrgUsageMetric): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/usage?metric=${metric}`);
}

function getOrgRoleSearchFilters<T>(orgId: string, roleId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/talent-search/role-filters?roleId=${encodeURIComponent(roleId)}`);
}

function performDashboardAction(
	orgId: string,
	data: DashboardActionRequest,
): Promise<ApiResult<Record<string, unknown>>> {
	return callApi<Record<string, unknown>, DashboardActionRequest>(
		`/api/organizations/${orgId}/dashboard/actions`,
		data,
		{ method: "PATCH", keepalive: true },
	);
}

function performDashboardActionByTalentJob(
	orgId: string,
	data: DashboardActionByTalentJobRequest,
): Promise<ApiResult<Record<string, unknown>>> {
	return callApi<Record<string, unknown>, DashboardActionByTalentJobRequest>(
		`/api/organizations/${orgId}/dashboard/actions-by-talent-job`,
		data,
		{ method: "PATCH" },
	);
}

function setDashboardFeedback(orgId: string, data: { opportunityId: number; interestCompanyReason: string }) {
	return callApi<{ success: true }, typeof data>(`/api/organizations/${orgId}/dashboard/feedback`, data, {
		method: "PATCH",
	});
}

export type { OrgFeedbackReason } from "@clera/shared-types";
export type { AtsImportSelection, AtsRemoteRole, DeliveryChannel, DeliveryChannels, DeliveryPreference };

interface SubmitOrgFeedbackRequest {
	reason: OrgFeedbackReason;
	comment: string;
	pagePath?: string;
	posthogSessionId?: string;
	posthogReplayUrl?: string;
}

function submitOrgFeedback(orgId: string, payload: SubmitOrgFeedbackRequest) {
	return callApi<{ id: string }, SubmitOrgFeedbackRequest>(`/api/organizations/${orgId}/feedback`, payload, {
		method: "POST",
	});
}

function reverseDashboardAction(
	orgId: string,
	data: { opportunityId: number; action: "pass" },
): Promise<ApiResult<Record<string, unknown>>> {
	return callApi<Record<string, unknown>, { opportunityId: number; action: "pass" }>(
		`/api/organizations/${orgId}/dashboard/reverse-action`,
		data,
		{ method: "PATCH" },
	);
}

function adminPassCandidate(
	orgId: string,
	data: { talentId: string; jobId: string },
): Promise<ApiResult<{ success: true; opportunityId: number }>> {
	return callApi<{ success: true; opportunityId: number }, { talentId: string; jobId: string }>(
		`/api/organizations/${orgId}/dashboard/review/admin-pass`,
		data,
		{ method: "POST" },
	);
}

function getReviewItems<T>(
	orgId: string,
	{ roleId }: { roleId?: string },
): Promise<ApiResult<DashboardListResponse<T>>> {
	const params = new URLSearchParams();
	if (roleId) params.set("roleId", roleId);
	const query = params.toString();
	return fetchApi<DashboardListResponse<T>>(`/api/organizations/${orgId}/dashboard/review${query ? `?${query}` : ""}`);
}

export interface TalentChips {
	talentId: string;
	companies: TalentEntityChip[];
	school: TalentEntityChip | null;
}

function getTalentChips(orgId: string, talentIds: string[]): Promise<ApiResult<{ chips: TalentChips[] }>> {
	const params = new URLSearchParams({ talentIds: talentIds.join(",") });
	return fetchApi<{ chips: TalentChips[] }>(`/api/organizations/${orgId}/talents/chips?${params.toString()}`);
}

function getSimilarPicks<T>(
	orgId: string,
	{ roleId, talentId }: { roleId: string; talentId: string },
): Promise<ApiResult<{ picks: T[] }>> {
	const params = new URLSearchParams({ roleId, talentId });
	return fetchApi<{ picks: T[] }>(`/api/organizations/${orgId}/dashboard/review/similar-picks?${params.toString()}`);
}

function getPassedItems<T>(
	orgId: string,
	{ limit, offset, roleId }: { limit: number; offset: number; roleId?: string },
): Promise<ApiResult<DashboardListResponse<T>>> {
	const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
	if (roleId) params.set("roleId", roleId);
	return fetchApi<DashboardListResponse<T>>(`/api/organizations/${orgId}/dashboard/review/passed?${params.toString()}`);
}

export interface RoleReviewCounts {
	pending: number;
	truncated: boolean;
}

function dismissReviewItems(
	orgId: string,
	items: { talentId: string; roleId: string | null }[],
): Promise<ApiResult<{ success: true; dismissed: number }>> {
	return callApi<{ success: true; dismissed: number }, { items: { talentId: string; roleId: string | null }[] }>(
		`/api/organizations/${orgId}/dashboard/review/dismiss`,
		{ items },
		{ method: "POST" },
	);
}

function updateRoleRequirements(
	orgId: string,
	roleId: string,
	data: UpdateRoleRequirementsRequest,
): Promise<ApiResult<Record<string, unknown>>> {
	return callApi<Record<string, unknown>, UpdateRoleRequirementsRequest>(
		`/api/organizations/${orgId}/roles/${roleId}/requirements`,
		data,
		{ method: "PUT" },
	);
}

function getInterviewTracker(orgId: string): Promise<ApiResult<InterviewTrackerResponse>> {
	return fetchApi<InterviewTrackerResponse>(`/api/organizations/${orgId}/interview-tracker`);
}

function markOnboarded<T>(orgId: string, data: unknown): Promise<ApiResult<T>> {
	return callApi<T, unknown>(`/api/organizations/${orgId}/onboarded`, data, { method: "POST" });
}

function createRole<T>(orgId: string, data: unknown): Promise<ApiResult<T>> {
	return callApi<T, unknown>(`/api/organizations/${orgId}/roles`, data);
}

function listRoles<T>(orgId: string, options?: { includeDeleted?: boolean }): Promise<ApiResult<T>> {
	const qs = options?.includeDeleted ? "?includeDeleted=true" : "";
	return fetchApi<T>(`/api/organizations/${orgId}/roles${qs}`);
}

function getRole<T>(orgId: string, roleId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/roles/${roleId}`);
}

function updateRole<T>(orgId: string, roleId: string, data: Record<string, unknown>): Promise<ApiResult<T>> {
	return callApi<T, Record<string, unknown>>(`/api/organizations/${orgId}/roles/${roleId}`, data, { method: "PATCH" });
}

function deleteRole<T>(orgId: string, roleId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/roles/${roleId}`, { method: "DELETE" });
}

function getRoleRequirements<T>(orgId: string, roleId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/roles/${roleId}/requirements`);
}

function getRoleQuestions<T>(orgId: string, roleId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/roles/${roleId}/questions`);
}

function createRoleQuestion<T>(orgId: string, roleId: string, data: unknown): Promise<ApiResult<T>> {
	return callApi<T, unknown>(`/api/organizations/${orgId}/roles/${roleId}/questions`, data);
}

function updateRoleQuestion<T>(orgId: string, roleId: string, data: unknown): Promise<ApiResult<T>> {
	return callApi<T, unknown>(`/api/organizations/${orgId}/roles/${roleId}/questions`, data, { method: "PUT" });
}

function deleteRoleQuestion<T>(orgId: string, roleId: string, questionId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/roles/${roleId}/questions?id=${questionId}`, { method: "DELETE" });
}

function reorderRoleQuestions<T>(orgId: string, roleId: string, data: unknown): Promise<ApiResult<T>> {
	return callApi<T, unknown>(`/api/organizations/${orgId}/roles/${roleId}/questions`, data, { method: "PATCH" });
}

function getRoleInterviewStages<T>(orgId: string, roleId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/roles/${roleId}/interview-stages`);
}

function updateRoleInterviewStages(
	orgId: string,
	roleId: string,
	data: {
		interviewStages: Array<{
			id?: string;
			name: string;
			description?: string | null;
			duration?: string | null;
			priority?: number | null;
		}>;
		reassignments?: Array<{ fromStageId: string; toStageId: string }>;
	},
): Promise<ApiResult<Record<string, unknown>>> {
	return callApi<Record<string, unknown>, typeof data>(
		`/api/organizations/${orgId}/roles/${roleId}/interview-stages`,
		data,
		{ method: "PUT" },
	);
}

function getRoleLocations<T>(orgId: string, roleId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/roles/${roleId}/locations`);
}

function addRoleLocation<T>(orgId: string, roleId: string, data: unknown): Promise<ApiResult<T>> {
	return callApi<T, unknown>(`/api/organizations/${orgId}/roles/${roleId}/locations`, data);
}

function deleteRoleLocation<T>(orgId: string, roleId: string, locationId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/roles/${roleId}/locations?locationId=${locationId}`, {
		method: "DELETE",
	});
}

function listMembers<T>(orgId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/members`);
}

function updateMember<T>(orgId: string, memberId: string, data: unknown): Promise<ApiResult<T>> {
	return callApi<T, unknown>(`/api/organizations/${orgId}/members/${memberId}`, data, { method: "PATCH" });
}

function deleteMember<T>(orgId: string, memberId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/members/${memberId}`, { method: "DELETE" });
}

function listOrgInvitations<T>(orgId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/invitations`);
}

function deleteOrgInvitation<T>(orgId: string, invitationId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/invitations?invitationId=${invitationId}`, { method: "DELETE" });
}

function inviteMember<T>(orgId: string, data: unknown): Promise<ApiResult<T>> {
	return callApi<T, unknown>(`/api/organizations/${orgId}/members`, data);
}

function updateOrg<T>(orgId: string, data: unknown): Promise<ApiResult<T>> {
	return callApi<T, unknown>(`/api/organizations/${orgId}`, data, { method: "PATCH" });
}

function getCompany<T>(orgId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/company`);
}

function updateCompany<T>(orgId: string, data: unknown): Promise<ApiResult<T>> {
	return callApi<T, unknown>(`/api/organizations/${orgId}/company`, data, { method: "PATCH" });
}

function getAgentLog<T>(companyId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${companyId}/company/agent-log`);
}

function getCompanyFunding<T>(orgId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}/company/funding-rounds`);
}

function createFundingRound<T>(orgId: string, data: unknown): Promise<ApiResult<T>> {
	return callApi<T, unknown>(`/api/organizations/${orgId}/company/funding-rounds`, data);
}

function updateFundingRound<T>(orgId: string, roundId: string, data: unknown): Promise<ApiResult<T>> {
	return callApi<T, unknown>(`/api/organizations/${orgId}/company/funding-rounds/${roundId}`, data, {
		method: "PATCH",
	});
}

function deleteFundingRound<T>(orgId: string, roundId: string): Promise<ApiResult<T>> {
	return callApi<T, unknown>(`/api/organizations/${orgId}/company/funding-rounds/${roundId}`, undefined, {
		method: "DELETE",
	});
}

function getSearches(orgId: string, limit = 20, offset = 0): Promise<ApiResult<SearchesListResponse>> {
	const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
	return fetchApi<SearchesListResponse>(`/api/organizations/${orgId}/searches?${params.toString()}`);
}

function getSearchStatus(searchSessionId: string): Promise<ApiResult<SearchStatusResponse>> {
	return fetchApi<SearchStatusResponse>(`/api/job-search/status?searchSessionId=${searchSessionId}`);
}

function markNoFit({
	talentId,
	jobId,
}: {
	talentId: string;
	jobId: string;
}): Promise<ApiResult<{ success: boolean; opportunity_id: number }>> {
	return callApi<{ success: boolean; opportunity_id: number }, Record<string, unknown>>(
		"/api/organizations/mark-no-fit",
		{ talent_id: talentId, job_id: jobId },
	);
}

function setIntroPromptDismissed(
	orgId: string,
	dismissed: boolean,
): Promise<ApiResult<{ success: boolean; updated: boolean }>> {
	return callApi<{ success: boolean; updated: boolean }, { dismissed: boolean }>(
		`/api/organizations/${orgId}/intro-prompt-dismissal`,
		{ dismissed },
		{ method: "PUT" },
	);
}

function listForUser<T>(): Promise<ApiResult<T>> {
	return fetchApi<T>("/api/user/organizations");
}

function getById<T>(orgId: string): Promise<ApiResult<T>> {
	return fetchApi<T>(`/api/organizations/${orgId}`);
}

export interface SendoutListEntry {
	dropId: string;
	nanoId: string;
	sentAt: string | null;
	talentIds: string[];
}

function getSendoutLists(orgId: string, roleId: string): Promise<ApiResult<{ drops: SendoutListEntry[] }>> {
	return fetchApi<{ drops: SendoutListEntry[] }>(
		`/api/organizations/${orgId}/dashboard/sendouts?roleId=${encodeURIComponent(roleId)}`,
	);
}

export const organizations = {
	listForUser,
	getById,
	create,
	requestAtsIntegration,
	getAtsIntegrationRequest,
	getSlackConnection,
	connectSlack,
	getDeliveryChannels,
	setDeliveryChannels,
	addDeliveryEmail,
	getAtsConnection,
	getAtsRemoteRoles,
	createAtsLinkToken,
	completeAtsConnection,
	disconnectAts,
	importAtsJobs,
	searchOrgTalents,
	suggestOrgTalentFacets,
	getOrgTalentFacets,
	runExternalTalentSearch,
	listExternalTalentSearches,
	getExternalTalentSearch,
	getExternalTalentFilterOptions,
	createContactLookup,
	listContactLookups,
	getOrgDailyUsage,
	getOrgRoleSearchFilters,
	performDashboardAction,
	performDashboardActionByTalentJob,
	getSimilarPicks,
	setDashboardFeedback,
	submitOrgFeedback,
	reverseDashboardAction,
	adminPassCandidate,
	getReviewItems,
	getSendoutLists,
	getTalentChips,
	getPassedItems,
	dismissReviewItems,
	getInterviewTracker,
	markOnboarded,
	createRole,
	listRoles,
	getRole,
	updateRole,
	deleteRole,
	getRoleRequirements,
	updateRoleRequirements,
	getRoleQuestions,
	createRoleQuestion,
	updateRoleQuestion,
	deleteRoleQuestion,
	reorderRoleQuestions,
	getRoleInterviewStages,
	updateRoleInterviewStages,
	getRoleLocations,
	addRoleLocation,
	deleteRoleLocation,
	listMembers,
	updateMember,
	deleteMember,
	listOrgInvitations,
	deleteOrgInvitation,
	inviteMember,
	updateOrg,
	getCompany,
	updateCompany,
	getAgentLog,
	getCompanyFunding,
	createFundingRound,
	updateFundingRound,
	deleteFundingRound,
	getSearches,
	getSearchStatus,
	markNoFit,
	setIntroPromptDismissed,
	tryClaimOrg,
	activateOrg,
	activateAndSwitchOrg,
};

interface TryClaimOrgResult {
	claimed: boolean;
	alreadyMember: boolean;
	hasOtherMembers: boolean;
	forbiddenRole: boolean;
	companyName: string | null;
	domainMismatch?: boolean;
}

function tryClaimOrg(companyId: string): Promise<ApiResult<TryClaimOrgResult>> {
	return callApi<TryClaimOrgResult, { companyId: string }>("/api/organizations/claim", { companyId });
}

interface ActivateOrgResult {
	activated: boolean;
	clerkOrgId: string | null;
}

function activateOrg(orgId: string): Promise<ApiResult<ActivateOrgResult>> {
	return callApi<ActivateOrgResult, Record<string, never>>(
		`/api/organizations/${orgId}/activate`,
		{},
		{ method: "POST" },
	);
}

async function activateAndSwitchOrg(organizationId: string): Promise<void> {
	const result = await activateOrg(organizationId);
	if (!result.ok) {
		throw new Error(`Org activation failed: ${result.error.status}`);
	}
	if (result.data.activated && result.data.clerkOrgId) {
		try {
			const { readClerkGlobal } = await import("@clera/auth/client");
			const clerk = readClerkGlobal();
			if (clerk) {
				await clerk.setActive({ organization: result.data.clerkOrgId });
			}
		} catch (err) {
			logger.warn("Clerk setActive failed, continuing with DB org switch", { error: String(err) });
		}
	}
	await userApi.setCurrentOrganization({ organizationId });
}
