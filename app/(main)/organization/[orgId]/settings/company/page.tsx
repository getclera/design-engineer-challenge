import { CompanySettings } from "@v2/features/org-settings";
import type { Metadata } from "next";
import { formatPageTitle } from "@/utils/pageTitle";
import { USERS } from "@mock/users";
import { loadOrgShell } from "../../_loader";

export const metadata: Metadata = { title: formatPageTitle("Company settings") };

export default async function CompanySettingsPage({
	params,
	searchParams,
}: {
	params: Promise<{ orgId: string }>;
	searchParams: Promise<{ focus?: string }>;
}) {
	const { orgId } = await params;
	const { focus } = await searchParams;
	const { viewerOrgRole } = await loadOrgShell({ orgId });
	const owner = USERS.find((u) => u.orgRole === "owner");
	return (
		<CompanySettings
			orgId={orgId}
			canEdit={viewerOrgRole !== "viewer"}
			ownerName={owner ? `${owner.firstName} ${owner.lastName}` : null}
			focus={focus}
		/>
	);
}
