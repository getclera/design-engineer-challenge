"use client";

import { OrgDashboardEvents } from "@clera/posthog-events";
import { usePostHog } from "posthog-js/react/slim";
import { useEffect, useRef } from "react";
import { type OrgTalentTracking, orgTalentEventProps } from "./org-talent-tracking";

interface TrackOrgTalentViewProps {
	tracking: OrgTalentTracking;
}

function TrackOrgTalentView({ tracking }: TrackOrgTalentViewProps) {
	const posthog = usePostHog();
	const lastTracked = useRef<string | null>(null);
	const key = `${tracking.surface}:${tracking.talentId}`;

	useEffect(() => {
		if (!posthog || lastTracked.current === key) return;
		lastTracked.current = key;
		posthog.capture(OrgDashboardEvents.TALENT_PROFILE_VIEWED, orgTalentEventProps(tracking));
	}, [posthog, key, tracking]);

	return null;
}
TrackOrgTalentView.displayName = "TrackOrgTalentView";

export { TrackOrgTalentView };
