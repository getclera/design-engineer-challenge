import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { V2ThemeScope } from "@v2/components/layout";
import { SidebarInset, SidebarProvider } from "@v2/components/ui/sidebar";
import { V2Toaster } from "@v2/components/ui/toaster";
import { OrgTalentProfileProvider } from "@v2/features/org-talent-profile";
import { ServerSearchParamsProvider } from "@v2/hooks/server-search-params";
import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { authKeys, companyKeys } from "@/lib/query-keys";
import { PostHogIdentify } from "../../_components/posthog-identify";
import { AppSidebar } from "./_components/app-sidebar";
import { MobileOrgHeader } from "./_components/mobile-org-header";
import { OrgErrorToast } from "./_components/org-error-toast";
import { OrgPageTracker } from "./_components/org-page-tracker";
import { PendingApprovalBanner } from "./_components/pending-approval-banner";
import { TermsAcceptModal } from "./_components/terms-accept-modal";
import { loadOrgShell } from "./_loader";

export const metadata: Metadata = {
	title: {
		template: "%s",
		default: "Clera",
	},
	robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function getSearchParamsFromHeaders(): Promise<Record<string, string>> {
	const hdrs = await headers();
	const url = hdrs.get("x-url") || hdrs.get("x-invoke-query") || "";
	try {
		if (url.startsWith("{")) {
			return JSON.parse(url);
		}
		const queryString = url.includes("?") ? url.split("?")[1] : "";
		return Object.fromEntries(new URLSearchParams(queryString));
	} catch {
		return {};
	}
}

export default async function OrgIdLayout({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<{ orgId: string }>;
}) {
	const { orgId } = await params;
	const [shellData, serverSearchParams] = await Promise.all([loadOrgShell({ orgId }), getSearchParamsFromHeaders()]);

	const queryClient = new QueryClient();
	queryClient.setQueryData(authKeys.me(), shellData.auth);
	queryClient.setQueryData(authKeys.meAuthed(), shellData.auth);
	queryClient.setQueryData(authKeys.organizations(), shellData.myOrganizations);
	if (shellData.viewerCanManageContacts) {
		queryClient.setQueryData(companyKeys.contactOptions(orgId), shellData.activeContactOptions);
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ServerSearchParamsProvider value={serverSearchParams}>
				<OrgTalentProfileProvider orgId={orgId}>
					<OrgPageTracker orgId={orgId} />
					<SidebarProvider defaultOpen={true}>
						<V2ThemeScope />
						<AppSidebar
							canManageContacts={shellData.viewerCanManageContacts}
							showTalentSearch={shellData.talentSearchEnabled}
						/>
						<SidebarInset>
							<MobileOrgHeader />
							{shellData.pendingApproval && <PendingApprovalBanner />}
							{children}
						</SidebarInset>
					</SidebarProvider>
					{!shellData.viewerIsPlatformAdmin && <TermsAcceptModal orgId={orgId} />}
					<OrgErrorToast />
					<V2Toaster duration={3000} />
					<PostHogIdentify />
				</OrgTalentProfileProvider>
			</ServerSearchParamsProvider>
		</HydrationBoundary>
	);
}
