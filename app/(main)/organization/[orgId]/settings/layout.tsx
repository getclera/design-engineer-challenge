import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { AdminPageShell } from "@v2/components/layout";
import { myProfileKey, SaveStatus, SettingsTabs } from "@v2/features/org-settings";
import type { ReactNode } from "react";
import { companyKeys } from "@/lib/query-keys";
import { myProfile } from "@mock/me";
import { ACTIVE_CONTACTS, COMPANY_PROFILE } from "@mock/org";
import { currentUser } from "@mock/store";
import { loadOrgShell } from "../_loader";

/**
 * Settings: Company, Communications, Members, Profile. What the tab counts read comes with the page, so they show
 * at once (roles and delivery channels come with the org layout, for the sidebar badge).
 */
export default async function SettingsLayout({
	params,
	children,
}: {
	params: Promise<{ orgId: string }>;
	children: ReactNode;
}) {
	const { orgId } = await params;
	const [, user] = await Promise.all([loadOrgShell({ orgId }), currentUser()]);
	const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });
	queryClient.setQueryData(companyKeys.full(orgId), COMPANY_PROFILE);
	queryClient.setQueryData(companyKeys.contactOptions(orgId), ACTIVE_CONTACTS);
	if (user) queryClient.setQueryData(myProfileKey(orgId), myProfile(user));

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			{/* Everyone can save something here (viewers: their own profile), so everyone sees the save status. */}
			<AdminPageShell title="Settings" actions={<SaveStatus />}>
				<div className="flex flex-col gap-5">
					<SettingsTabs orgId={orgId} />
					{children}
				</div>
			</AdminPageShell>
		</HydrationBoundary>
	);
}
