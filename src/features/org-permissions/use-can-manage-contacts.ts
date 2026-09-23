"use client";

import { useAuthApi } from "@v2/hooks/use-auth-api";
import { useOrganizations } from "@v2/hooks/use-organizations";

function useCanManageContacts(): boolean {
	const { profile, isLoading } = useAuthApi();
	const { currentOrg, loading } = useOrganizations();

	if (isLoading || loading || !currentOrg) return true;

	return profile?.role === "admin" || currentOrg.role === "owner" || currentOrg.role === "editor";
}

export { useCanManageContacts };
