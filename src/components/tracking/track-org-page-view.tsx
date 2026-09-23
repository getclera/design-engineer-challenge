"use client";

import type { OrgDashboardEventName } from "@clera/posthog-events";
import { useParams } from "next/navigation";
import { usePostHog } from "posthog-js/react/slim";
import { useEffect, useRef } from "react";

interface TrackOrgPageViewProps {
	event: OrgDashboardEventName;
	props?: Record<string, unknown>;
}

export function TrackOrgPageView({ event, props }: TrackOrgPageViewProps) {
	const posthog = usePostHog();
	const params = useParams<{
		orgId?: string;
		roleId?: string;
		searchId?: string;
		candidateId?: string;
		talentId?: string;
	}>();
	const fired = useRef(false);

	useEffect(() => {
		if (fired.current || !posthog) return;
		fired.current = true;
		posthog.capture(event, {
			org_id: params?.orgId,
			role_id: params?.roleId,
			search_id: params?.searchId,
			candidate_id: params?.candidateId,
			talent_id: params?.talentId,
			...props,
		});
	}, [posthog, event, params, props]);

	return null;
}

TrackOrgPageView.displayName = "TrackOrgPageView";
