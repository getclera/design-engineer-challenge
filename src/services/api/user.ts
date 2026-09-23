import { type ApiResult, callApi, fetchApi } from "./client";

interface GetUserRoleResponse {
	success: boolean;

	role: string | null;
}

interface GetUserCompanyResponse {
	companyId: string | null;
	companyName: string | null;
}

function getRole(): Promise<ApiResult<GetUserRoleResponse>> {
	return fetchApi<GetUserRoleResponse>("/api/user/role");
}

function getCompany(): Promise<ApiResult<GetUserCompanyResponse>> {
	return fetchApi<GetUserCompanyResponse>("/api/user/company");
}

interface SetCurrentOrganizationRequest {
	organizationId: string;
}

interface SetCurrentOrganizationResponse {
	success: boolean;
}

function setCurrentOrganization(
	request: SetCurrentOrganizationRequest,
): Promise<ApiResult<SetCurrentOrganizationResponse>> {
	return callApi<SetCurrentOrganizationResponse, SetCurrentOrganizationRequest>(
		"/api/user/current-organization",
		request,
	);
}

export const user = {
	getRole,
	getCompany,
	setCurrentOrganization,
};
