import { requireOrgAccess } from "@app/api/_utils/auth";
import { OrgDashboardEvents } from "@clera/posthog-events";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { AdminPageShell } from "@v2/components/layout";
import { TrackOrgPageView } from "@v2/components/tracking";
import { ReviewBoard } from "@v2/features/org-review";
import type { Metadata } from "next";
import { Suspense } from "react";
import { orgDashboardKeys } from "@/lib/query-keys";
import { formatPageTitle } from "@/utils/pageTitle";
import { loadOrgShell } from "../_loader";
import { loadReviewItems, loadSendoutScope } from "./_loader";
import Loading from "./loading";

export const metadata: Metadata = { title: formatPageTitle("Review") };

export default async function OrgReviewPage({
	params,
	searchParams,
}: {
	params: Promise<{ orgId: string }>;
	searchParams: Promise<{ role?: string; talent?: string; view?: string; streams?: string; sendout?: string }>;
}) {
	const { orgId } = await params;
	const { role, talent: talentId, view, streams, sendout } = await searchParams;
	const access = await requireOrgAccess(orgId);
	const viewerIsPlatformAdmin = access.success === true && access.isAdmin === true;

	return (
		<Suspense fallback={<Loading />}>
			<OrgReviewContent
				orgId={orgId}
				role={role}
				talentId={talentId}
				view={view}
				streams={streams}
				sendout={sendout}
				viewerIsPlatformAdmin={viewerIsPlatformAdmin}
			/>
		</Suspense>
	);
}

async function OrgReviewContent({
	orgId,
	role,
	talentId,
	view,
	streams,
	sendout,
	viewerIsPlatformAdmin,
}: {
	orgId: string;
	role?: string;
	talentId?: string;
	view?: string;
	streams?: string;
	sendout?: string;
	viewerIsPlatformAdmin: boolean;
}) {
	const roleId = role === "all" ? undefined : role;
	const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Number.POSITIVE_INFINITY } } });

	const [sendoutScope, { canUseTalentSearch }] = await Promise.all([
		sendout ? loadSendoutScope({ orgId, nanoId: sendout }) : null,
		loadOrgShell({ orgId }),
	]);

	const effectiveRoleId = sendoutScope?.jobId ?? roleId;
	const data = await loadReviewItems({ orgId, roleId: effectiveRoleId });
	if (data) {
		queryClient.setQueryData(orgDashboardKeys.review(orgId, effectiveRoleId), data);
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<TrackOrgPageView event={OrgDashboardEvents.REVIEW_VIEWED} />
			<AdminPageShell title="Review" subtitle="Everyone waiting on your decision">
				<ReviewBoard
					orgId={orgId}
					roleParam={effectiveRoleId ?? role}
					talentId={talentId}
					view={view}
					streams={streams}
					sendoutNanoId={sendoutScope ? sendout : undefined}
					sendoutTalentIds={sendoutScope?.talentIds}
					canUseTalentSearch={canUseTalentSearch}
					viewerIsPlatformAdmin={viewerIsPlatformAdmin}
				/>
			</AdminPageShell>
		</HydrationBoundary>
	);
}
