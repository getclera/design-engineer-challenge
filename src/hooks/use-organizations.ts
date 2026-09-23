"use client";

import { orgRoutes } from "@clera/route-factory";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthApi } from "@v2/hooks/use-auth-api";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { OrgRole } from "@/lib/auth/org-access";
import { authKeys } from "@/lib/query-keys";
import { organizations as organizationsApi } from "@/services/api/organizations";

export interface Organization {
	organizationId: string;
	role: OrgRole;
	joinedAt: string;
	name: string;
	logo: string | null;
	website: string | null;
}

const fetchOrganizations = async (): Promise<Organization[]> => {
	const result = await organizationsApi.listForUser<{ organizations: Organization[] }>();
	if (!result.ok) {
		throw new Error("Failed to fetch organizations");
	}
	return result.data.organizations || [];
};

export function useOrganizations() {
	const { orgId } = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { isAuthenticated, isLoading: isAuthLoading } = useAuthApi();

	const currentOrgId = typeof orgId === "string" ? orgId : null;

	const {
		data: organizations = [],
		isLoading: loading,
		refetch,
	} = useQuery({
		queryKey: authKeys.organizations(),
		queryFn: fetchOrganizations,
		enabled: isAuthenticated,
		retry: false,
	});

	const { data: orgDetails, isLoading: isLoadingOrgDetails } = useQuery<Organization | null>({
		queryKey: authKeys.organizationDetails(currentOrgId ?? ""),
		queryFn: async () => {
			if (!currentOrgId) {
				return null;
			}
			const orgFromList = organizations.find((o) => o.organizationId === currentOrgId);
			if (orgFromList) {
				return orgFromList;
			}
			const result = await organizationsApi.getById<{ organization: Organization | null }>(currentOrgId);
			if (!result.ok) {
				return null;
			}
			return result.data.organization ?? null;
		},
		enabled: !!currentOrgId && !organizations.find((o) => o.organizationId === currentOrgId) && !loading,
	});

	const currentOrg = useMemo<Organization | null>(() => {
		if (!currentOrgId) {
			return null;
		}
		const orgFromList = organizations.find((o) => o.organizationId === currentOrgId);
		if (orgFromList) {
			return orgFromList;
		}
		if (orgDetails) {
			return orgDetails;
		}
		if (isLoadingOrgDetails) {
			return null;
		}
		return {
			organizationId: currentOrgId,
			role: "viewer",
			joinedAt: new Date().toISOString(),
			name: "",
			logo: null,
			website: null,
		};
	}, [currentOrgId, organizations, orgDetails, isLoadingOrgDetails]);

	const setCurrentOrg = useCallback(
		async (organizationId: string) => {
			await organizationsApi.activateAndSwitchOrg(organizationId);
			queryClient.invalidateQueries({ queryKey: authKeys.organizations() });
			router.push(orgRoutes.detail(organizationId));
		},
		[queryClient, router],
	);

	const refreshOrganizations = useCallback(async () => {
		await refetch();
	}, [refetch]);

	return {
		organizations,
		currentOrg,
		loading: loading || isAuthLoading,
		setCurrentOrg,
		refreshOrganizations,
	};
}
