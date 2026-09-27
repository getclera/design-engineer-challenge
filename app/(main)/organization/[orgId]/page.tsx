import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { AdminPageShell } from "@v2/components/layout";
import { HomeAnswerLine, HomeDashboard, HomeDashboardSkeleton } from "@v2/features/org-home";
import type { Metadata } from "next";
import { Suspense } from "react";
import { orgDashboardKeys, roleKeys } from "@/lib/query-keys";
import { formatPageTitle } from "@/utils/pageTitle";
import { COMPANY_SETUP } from "@mock/org";
import { ROLES } from "@mock/roles";
import { loadOrgShell } from "./_loader";
import { loadReviewItems } from "./review/_loader";

export const metadata: Metadata = { title: formatPageTitle("Home") };

export default async function OrgHomePage({ params }: { params: Promise<{ orgId: string }> }) {
	const { orgId } = await params;
	return (
		// Here, not in loading.tsx: that file would also cover every other page under /organization/[orgId].
		<Suspense
			fallback={
				<AdminPageShell title="Home" subtitle="What needs you this week">
					<HomeDashboardSkeleton />
				</AdminPageShell>
			}
		>
			<OrgHomeContent orgId={orgId} />
		</Suspense>
	);
}

async function OrgHomeContent({ orgId }: { orgId: string }) {
	const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Number.POSITIVE_INFINITY } } });
	const [{ viewerOrgRole }, feed] = await Promise.all([loadOrgShell({ orgId }), loadReviewItems({ orgId })]);
	queryClient.setQueryData(orgDashboardKeys.review(orgId, undefined), feed);
	// Roles come with the page too, so Home shows at once instead of a skeleton while they load.
	queryClient.setQueryData(roleKeys.organizationRoles(orgId, false), ROLES);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<AdminPageShell title="Home" subtitle={<HomeAnswerLine orgId={orgId} setup={COMPANY_SETUP} />}>
				<HomeDashboard orgId={orgId} setup={COMPANY_SETUP} canEdit={viewerOrgRole !== "viewer"} />
			</AdminPageShell>
		</HydrationBoundary>
	);
}
