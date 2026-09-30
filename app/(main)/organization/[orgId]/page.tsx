import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { AdminPageShell } from "@v2/components/layout";
import { HomeDashboard, HomeDashboardSkeleton, type HomeDemo, parseHomeDemo } from "@v2/features/org-home";
import type { Metadata } from "next";
import { Suspense } from "react";
import { companyKeys, orgDashboardKeys, roleKeys } from "@/lib/query-keys";
import { formatPageTitle } from "@/utils/pageTitle";
import { companyGaps } from "@v2/features/org-settings/company-profile";
import { ACTIVE_CONTACTS, COMPANY_PROFILE, COMPANY_SETUP, NEXT_DROP } from "@mock/org";
import { buildMovingForward } from "@mock/pipeline";
import { ROLES } from "@mock/roles";
import { loadOrgShell } from "./_loader";
import { loadReviewItems } from "./review/_loader";

export const metadata: Metadata = { title: formatPageTitle("Home") };

export default async function OrgHomePage({
	params,
	searchParams,
}: {
	params: Promise<{ orgId: string }>;
	searchParams: Promise<{ demo?: string }>;
}) {
	const { orgId } = await params;
	// ?demo=day1 | quiet | done shows Home's other moments; the mock data is always one busy week.
	const demo = parseHomeDemo((await searchParams).demo);
	return (
		// Here, not in loading.tsx: that file would also cover every other page under /organization/[orgId].
		<Suspense
			fallback={
				<AdminPageShell title="Home" subtitle="What needs you this week">
					<HomeDashboardSkeleton />
				</AdminPageShell>
			}
		>
			<OrgHomeContent orgId={orgId} demo={demo} />
		</Suspense>
	);
}

async function OrgHomeContent({ orgId, demo }: { orgId: string; demo: HomeDemo | null }) {
	const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Number.POSITIVE_INFINITY } } });
	const [{ viewerOrgRole }, feed] = await Promise.all([loadOrgShell({ orgId }), loadReviewItems({ orgId })]);
	queryClient.setQueryData(orgDashboardKeys.review(orgId, undefined), feed);
	// Roles come with the page too, so Home shows at once instead of a skeleton while they load.
	queryClient.setQueryData(roleKeys.organizationRoles(orgId, false), ROLES);
	// And the hiring managers, so the scheduling-link fixes don't pop in and push "Start reviewing" down.
	queryClient.setQueryData(companyKeys.contactOptions(orgId), ACTIVE_CONTACTS);
	// The same gaps Settings lists, so filling one there clears it here.
	const gaps = companyGaps(COMPANY_PROFILE);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<AdminPageShell title="Home" subtitle="What needs you this week">
				<HomeDashboard
					orgId={orgId}
					setup={{ ...COMPANY_SETUP, profileMissing: gaps.map((g) => g.label), profileFocus: gaps[0]?.key }}
					canEdit={viewerOrgRole !== "viewer"}
					moving={buildMovingForward()}
					nextDrop={NEXT_DROP}
					demo={demo}
				/>
			</AdminPageShell>
		</HydrationBoundary>
	);
}
