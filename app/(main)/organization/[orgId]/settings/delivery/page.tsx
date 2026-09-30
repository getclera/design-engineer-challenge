import { orgRoutes } from "@clera/route-factory";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { CommunicationsSettings, deliveryKey } from "@v2/features/org-settings";
import type { Metadata } from "next";
import { formatPageTitle } from "@/utils/pageTitle";
import { DELIVERY } from "@mock/org";
import { USERS } from "@mock/users";
import { loadOrgShell } from "../../_loader";

export const metadata: Metadata = { title: formatPageTitle("Communications settings") };

export default async function CommunicationsSettingsPage({ params }: { params: Promise<{ orgId: string }> }) {
	const { orgId } = await params;
	const { viewerOrgRole } = await loadOrgShell({ orgId });
	const owner = USERS.find((u) => u.orgRole === "owner");
	// The settings come with the page, so the tab doesn't open blank.
	const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });
	queryClient.setQueryData(deliveryKey(orgId), DELIVERY);
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<CommunicationsSettings
				orgId={orgId}
				canEdit={viewerOrgRole !== "viewer"}
				ownerName={owner ? `${owner.firstName} ${owner.lastName}` : null}
				atsHref={orgRoutes.integrations(orgId)}
			/>
		</HydrationBoundary>
	);
}
