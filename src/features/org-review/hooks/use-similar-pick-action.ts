"use client";

import { OrgDashboardEvents } from "@clera/posthog-events";
import { TALENT_NOT_OPEN_ERROR } from "@clera/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePostHog } from "posthog-js/react/slim";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { organizations } from "@/services/api";
import { invalidateOrgDashboard } from "./invalidate-org-dashboard";
import type { SimilarFollowThrough } from "./use-similar-follow-through";

export type SimilarPickDecision = "requested" | "passed";

interface SimilarPickActionPayload {
	talentId: string;
	action: "request_intro" | "pass";
}

export function useSimilarPickAction(orgId: string, followThrough: SimilarFollowThrough, onAllDecided: () => void) {
	const queryClient = useQueryClient();
	const posthog = usePostHog();
	const [decisions, setDecisions] = useState<Record<string, SimilarPickDecision>>({});
	const decisionsRef = useRef<Record<string, SimilarPickDecision>>({});

	const mutation = useMutation({
		mutationFn: async ({ talentId, action }: SimilarPickActionPayload) => {
			const result = await organizations.performDashboardActionByTalentJob(orgId, {
				talentId,
				jobId: followThrough.roleId,
				action,
				origin: "similar_picks",
				similarAnchorTalentId: followThrough.anchor.talentId,
			});
			if (!result.ok) throw new Error(result.error.message);
			return result.data;
		},
		onSuccess: (_data, { talentId, action }) => {
			posthog?.capture(
				action === "request_intro"
					? OrgDashboardEvents.SIMILAR_PICK_INTRO_REQUESTED
					: OrgDashboardEvents.SIMILAR_PICK_PASSED,
				{
					org_id: orgId,
					role_id: followThrough.roleId,
					talent_id: talentId,
					anchor_talent_id: followThrough.anchor.talentId,
				},
			);
			const decision: SimilarPickDecision = action === "request_intro" ? "requested" : "passed";
			decisionsRef.current = { ...decisionsRef.current, [talentId]: decision };
			setDecisions(decisionsRef.current);
			if (followThrough.picks.every((pick) => decisionsRef.current[pick.talentId])) onAllDecided();
		},
		onError: (error) => {
			const notOpen = error instanceof Error && error.message.includes(TALENT_NOT_OPEN_ERROR);
			toast.error(notOpen ? "This candidate is not currently open to opportunities." : "Something went wrong");
		},
		onSettled: () => invalidateOrgDashboard(queryClient),
	});

	const pendingTalentId = mutation.isPending ? (mutation.variables?.talentId ?? null) : null;

	return { decisions, act: mutation.mutate, pendingTalentId };
}
