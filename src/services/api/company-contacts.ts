import type { CompanyContact, CompanyContactFormData } from "@/types/company-contact";
import { type ApiResult, callApi, fetchApi } from "./client";

function list(companyId: string): Promise<ApiResult<CompanyContact[]>> {
	return fetchApi<CompanyContact[]>(`/api/organizations/${companyId}/contacts`);
}

export type ContactOption = Pick<
	CompanyContact,
	"id" | "firstName" | "lastName" | "email" | "title" | "calendarLink" | "isPrimary" | "createdAt"
>;

function listActive(companyId: string): Promise<ApiResult<ContactOption[]>> {
	return fetchApi<ContactOption[]>(`/api/organizations/${companyId}/contacts/active`);
}

function get(companyId: string, contactId: string): Promise<ApiResult<CompanyContact>> {
	return fetchApi<CompanyContact>(`/api/organizations/${companyId}/contacts/${contactId}`);
}

function create(companyId: string, data: CompanyContactFormData): Promise<ApiResult<CompanyContact>> {
	return callApi<CompanyContact, CompanyContactFormData>(`/api/organizations/${companyId}/contacts`, data);
}

function update(
	companyId: string,
	contactId: string,
	data: Partial<CompanyContactFormData>,
): Promise<ApiResult<CompanyContact>> {
	return callApi<CompanyContact, Partial<CompanyContactFormData>>(
		`/api/organizations/${companyId}/contacts/${contactId}`,
		data,
		{ method: "PATCH" },
	);
}

function remove(companyId: string, contactId: string): Promise<ApiResult<{ success: boolean }>> {
	return callApi<{ success: boolean }, Record<string, never>>(
		`/api/organizations/${companyId}/contacts/${contactId}`,
		{},
		{ method: "DELETE" },
	);
}

function setPrimary(companyId: string, contactId: string): Promise<ApiResult<CompanyContact>> {
	return callApi<CompanyContact, Record<string, never>>(
		`/api/organizations/${companyId}/contacts/${contactId}/primary`,
		{},
		{ method: "PATCH" },
	);
}

export function setActive(companyId: string, contactId: string, active: boolean): Promise<ApiResult<CompanyContact>> {
	return callApi<CompanyContact, { active: boolean }>(
		`/api/organizations/${companyId}/contacts/${contactId}/activation`,
		{ active },
		{ method: "PATCH" },
	);
}

export const companyContacts = {
	list,
	listActive,
	get,
	create,
	update,
	remove,
	setPrimary,
	setActive,
};
