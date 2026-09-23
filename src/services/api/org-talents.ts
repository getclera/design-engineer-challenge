import type { MergedProfileData } from "@edge-functions/talent-service/data/mergeProfileData";
import type { PreferencesData, TalentHeaderData } from "@/services/api/talents";
import { callApi, fetchApi } from "./client";

export interface OrgTalentProfileBundle {
	header: Pick<
		TalentHeaderData,
		| "id"
		| "firstname"
		| "lastname"
		| "email"
		| "phone"
		| "linkedinUrl"
		| "portfolioUrl"
		| "githubUrl"
		| "xUrl"
		| "avatarUrl"
		| "occupation"
		| "location"
		| "yearsExperience"
		| "jobSearchStatus"
		| "availableStartDate"
		| "resumePath"
	> & {
		fullName: string | null;
		oneLiner: string | null;
		resumeScope: { orgId?: string } | null;
		talentTags: string[];
	};
	mergedProfile: Pick<MergedProfileData, "experiences" | "education" | "skills" | "languages" | "certifications">;
	preferences: PreferencesData & { visaDetails: string | null; openToOpportunities: boolean | null };
}

export function orgTalentProfilePath(orgId: string, talentId: string): string {
	return `/api/organizations/${orgId}/talents/${talentId}/profile`;
}

function fetchProfile(orgId: string, talentId: string) {
	return fetchApi<OrgTalentProfileBundle>(orgTalentProfilePath(orgId, talentId));
}

function fetchPublicDropProfile(dropId: string, talentId: string) {
	return fetchApi<OrgTalentProfileBundle>(`/api/public/drops/${dropId}/talents/${talentId}/profile`);
}

export interface DropContactInput {
	firstName: string;
	lastName?: string | null;
	email: string;
	title?: string | null;
	linkedinUrl?: string | null;
	calendarLink?: string | null;
	role?: string | null;
	salaryRange?: string | null;
	jdLink?: string;
	companyDomain?: string | null;
	acceptedTerms?: boolean;
	echoed?: boolean;
}

export interface PublicDropActionInput {
	talentId: string;
	action: "request_intro" | "pass";
	rejectReason?: string;
	noFitCategory?: string;
	interestCompanyReason?: string;
	interestCompanyCategory?: string;
	newContact?: DropContactInput;
}

interface PublicDropActionResponse {
	success: true;
	pendingApproval?: boolean;
	action: "request_intro" | "pass";
	opportunity: { id: number; status: string | null; interestCompany: boolean | null } | null;
}

function performPublicDropAction(dropId: string, input: PublicDropActionInput) {
	return callApi<PublicDropActionResponse, PublicDropActionInput>(`/api/public/drops/${dropId}/actions`, input, {
		method: "POST",
		keepalive: true,
	});
}

function unlockDrop(dropId: string, workEmail: string) {
	return callApi<{ unlocked: boolean }, { workEmail: string }>(
		`/api/public/drops/${dropId}/unlock`,
		{ workEmail },
		{ method: "POST" },
	);
}

interface BatchRequestBody {
	talentIds: string[];
	newContact?: DropContactInput;
}

function batchRequestIntro(dropId: string, body: BatchRequestBody) {
	return callApi<
		{ requestedTalentIds: string[]; failedTalentIds: string[]; pendingApproval: boolean },
		BatchRequestBody
	>(`/api/public/drops/${dropId}/batch-request`, body, {
		method: "POST",
		keepalive: true,
	});
}

function submitDropBrief(dropId: string, body: { brief: string; workEmail?: string }) {
	return callApi<{ received: boolean }, { brief: string; workEmail?: string }>(
		`/api/public/drops/${dropId}/brief`,
		body,
		{ method: "POST" },
	);
}

function recordTalentView(
	orgId: string,
	body: {
		talentId: string;
		source: "review" | "talent_search";
		interaction?: "open" | "impression";
		appliedFilters?: Record<string, unknown> | null;
	},
) {
	return callApi<{ recorded: boolean }, typeof body>(`/api/organizations/${orgId}/talent-views`, body, {
		method: "POST",
	});
}

function recordTalentImpressions(
	orgId: string,
	body: {
		talentIds: string[];
		source: "review" | "review_similar" | "talent_search";
		appliedFilters?: Record<string, unknown> | null;
	},
) {
	return callApi<{ recorded: number }, typeof body>(`/api/organizations/${orgId}/talent-views/seen`, body, {
		method: "POST",
		keepalive: true,
	});
}

function recordFilterApplication(
	orgId: string,
	body: { appliedFilters: Record<string, unknown>; query?: string | null; resultCount?: number | null },
) {
	return callApi<{ recorded: boolean }, typeof body>(`/api/organizations/${orgId}/talent-views/filter`, body, {
		method: "POST",
	});
}

function dismissSearchTalent(
	orgId: string,
	body: { talentId: string; appliedFilters?: Record<string, unknown> | null },
) {
	return callApi<{ recorded: boolean }, typeof body>(`/api/organizations/${orgId}/talent-views/dismiss`, body, {
		method: "POST",
	});
}

function submitDropFeedback(dropId: string, input: { talentId: string; interestCompanyReason: string }) {
	return callApi<{ success: true }, typeof input>(`/api/public/drops/${dropId}/feedback`, input, { method: "POST" });
}

export const orgTalents = {
	fetchProfile,
	fetchPublicDropProfile,
	performPublicDropAction,
	submitDropFeedback,
	unlockDrop,
	batchRequestIntro,
	submitDropBrief,
	recordTalentView,
	recordTalentImpressions,
	recordFilterApplication,
	dismissSearchTalent,
};
