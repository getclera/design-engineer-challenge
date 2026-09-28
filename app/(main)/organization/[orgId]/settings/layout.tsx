import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { AdminPageShell } from "@v2/components/layout";
import { SaveStatus, SettingsTabs } from "@v2/features/org-settings";
import type { ReactNode } from "react";
import { companyKeys, roleKeys } from "@/lib/query-keys";
import { ACTIVE_CONTACTS, COMPANY_PROFILE } from "@mock/org";
import { ROLES } from "@mock/roles";
import { loadOrgShell } from "../_loader";

/** Settings: Company and Team. The profile, hiring managers and roles come with the page, so the tab counts show at once. */
export default async function SettingsLayout({
	params,
	children,
}: {
	params: Promise<{ orgId: string }>;
	children: ReactNode;
}) {
	const { orgId } = await params;
	const { viewerOrgRole } = await loadOrgShell({ orgId });
	const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });
	queryClient.setQueryData(companyKeys.full(orgId), COMPANY_PROFILE);
	queryClient.setQueryData(companyKeys.contactOptions(orgId), ACTIVE_CONTACTS);
	queryClient.setQueryData(roleKeys.organizationRoles(orgId, false), ROLES);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<AdminPageShell
				title="Settings"
				subtitle="What candidates see, and who's on your team"
				actions={viewerOrgRole !== "viewer" ? <SaveStatus /> : undefined}
			>
				<SettingsTabs orgId={orgId} />
				{children}
			</AdminPageShell>
		</HydrationBoundary>
	);
}
