"use client";

import { OrgDashboardEvents } from "@clera/posthog-events";
import { useQueryClient } from "@tanstack/react-query";
import { linkedinClickedEventProps, type OrgTalentSurface } from "@v2/components/tracking";
import { ensureOrgTalentProfile } from "@v2/features/org-talent-profile";
import { usePostHog } from "posthog-js/react/slim";
import { useCallback } from "react";
import { scrollTalentBoardPaneToTop } from "../talent-board-pane-scroll";

function navigateTab(tab: Window | null, url: string) {
	if (!tab) return;
	tab.opener = null;
	tab.location.href = url;
}

export function useTalentBoardOpen(orgId: string, surface: OrgTalentSurface) {
	const queryClient = useQueryClient();
	const posthog = usePostHog();

	return useCallback(
		async (talentId: string, linkedinUrl?: string | null) => {
			if (linkedinUrl === null) {
				scrollTalentBoardPaneToTop();
				return;
			}
			const tab = window.open("about:blank", "_blank");
			let url: string | null | undefined;
			try {
				url = linkedinUrl ?? (await ensureOrgTalentProfile(queryClient, orgId, talentId)).header.linkedinUrl;
			} catch (error) {
				tab?.close();
				throw error;
			}
			if (!url) {
				tab?.close();
				scrollTalentBoardPaneToTop();
				return;
			}
			posthog?.capture(
				OrgDashboardEvents.TALENT_LINKEDIN_CLICKED,
				linkedinClickedEventProps({ orgId, talentId, surface }, "row", url),
			);
			navigateTab(tab, url);
		},
		[queryClient, posthog, orgId, surface],
	);
}
