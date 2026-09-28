import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { invitationsKey, membersKey, TeamSettings } from "@v2/features/org-settings";
import type { Metadata } from "next";
import { orgDashboardKeys } from "@/lib/query-keys";
import { formatPageTitle } from "@/utils/pageTitle";
import { INVITATIONS } from "@mock/org";
import { currentUser } from "@mock/store";
import { USERS } from "@mock/users";
import { loadOrgShell } from "../../_loader";
import { loadReviewItems } from "../../review/_loader";

export const metadata: Metadata = { title: formatPageTitle("Team settings") };

export default async function TeamSettingsPage({
	params,
	searchParams,
}: {
	params: Promise<{ orgId: string }>;
	searchParams: Promise<{ focus?: string; role?: string }>;
}) {
	const { orgId } = await params;
	const { focus, role } = await searchParams;
	const [{ viewerOrgRole }, me, feed] = await Promise.all([
		loadOrgShell({ orgId }),
		currentUser(),
		loadReviewItems({ orgId }),
	]);
	const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });
	queryClient.setQueryData(
		membersKey(orgId),
		USERS.map((u) => ({
			id: u.profileId,
			role: u.orgRole,
			firstName: u.firstName,
			lastName: u.lastName,
			email: u.email,
		})),
	);
	queryClient.setQueryData(invitationsKey(orgId), INVITATIONS);
	// Waiting counts per role ("8 candidates can't book a call") come from Review's feed.
	queryClient.setQueryData(orgDashboardKeys.review(orgId, undefined), feed);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<TeamSettings
				orgId={orgId}
				canEdit={viewerOrgRole !== "viewer"}
				meId={me?.profileId ?? ""}
				focus={focus}
				focusRole={role}
			/>
		</HydrationBoundary>
	);
}
