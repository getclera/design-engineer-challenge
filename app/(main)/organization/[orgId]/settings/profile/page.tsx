import { ProfileSettings } from "@v2/features/org-settings";
import type { Metadata } from "next";
import { formatPageTitle } from "@/utils/pageTitle";
import { ORGANIZATION } from "@mock/org";

export const metadata: Metadata = { title: formatPageTitle("Profile settings") };

export default async function ProfileSettingsPage({ params }: { params: Promise<{ orgId: string }> }) {
	const { orgId } = await params;
	return <ProfileSettings orgId={orgId} companyName={ORGANIZATION.name} />;
}
