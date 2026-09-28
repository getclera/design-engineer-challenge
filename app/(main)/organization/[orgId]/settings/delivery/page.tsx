import { orgRoutes } from "@clera/route-factory";
import { CommunicationsSettings } from "@v2/features/org-settings";
import type { Metadata } from "next";
import { formatPageTitle } from "@/utils/pageTitle";
import { USERS } from "@mock/users";
import { loadOrgShell } from "../../_loader";

export const metadata: Metadata = { title: formatPageTitle("Communications settings") };

export default async function CommunicationsSettingsPage({ params }: { params: Promise<{ orgId: string }> }) {
	const { orgId } = await params;
	const { viewerOrgRole } = await loadOrgShell({ orgId });
	const owner = USERS.find((u) => u.orgRole === "owner");
	return (
		<CommunicationsSettings
			orgId={orgId}
			canEdit={viewerOrgRole !== "viewer"}
			ownerName={owner ? `${owner.firstName} ${owner.lastName}` : null}
			atsHref={orgRoutes.integrations(orgId)}
		/>
	);
}
