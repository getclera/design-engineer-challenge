"use client";

import { OrgDashboardEvents } from "@clera/posthog-events";
import { useMutation } from "@tanstack/react-query";
import { useUser } from "@v2/hooks/use-user";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react/slim";
import { toast } from "sonner";
import { orgFeedbackKeys } from "@/lib/query-keys";
import { organizations, unwrap } from "@/services/api";
import logger from "@/utils/logger";
import { getFeedbackPageContext } from "../feedback-context";
import { useOrgFeedbackDialog } from "../store";

type SubmittedFeedback = Pick<Parameters<typeof organizations.submitOrgFeedback>[1], "reason" | "comment">;

function clearDraftUnlessReplaced(contextKey: string, submitted: SubmittedFeedback) {
	const store = useOrgFeedbackDialog.getState();
	const current = store.drafts[contextKey];
	if (current && (current.reason !== submitted.reason || current.comment?.trim() !== submitted.comment.trim())) return;
	store.clearDraft(contextKey);
}

export function useSubmitOrgFeedback() {
	const { orgId, roleId } = useParams<{ orgId: string; roleId?: string }>();
	const pathname = usePathname();
	const posthog = usePostHog();
	const { user } = useUser();
	const searchParams = useSearchParams();
	const context = getFeedbackPageContext(pathname, searchParams.get("role") ?? roleId);

	const contextKey = `${user.id}:${orgId}:${context.pagePath}`;
	const mutation = useMutation({
		mutationKey: orgFeedbackKeys.submit(orgId),
		onMutate: () => ({ contextKey, orgId, pathname }),
		mutationFn: (values: Pick<Parameters<typeof organizations.submitOrgFeedback>[1], "reason" | "comment">) =>
			organizations
				.submitOrgFeedback(orgId, {
					...values,
					comment: values.comment.trim(),
					pagePath: context.pagePath,
					posthogSessionId: posthog?.get_session_id(),
					posthogReplayUrl:
						posthog?.get_session_replay_url({ withTimestamp: true, timestampLookBack: 30 }) || undefined,
				})
				.then(unwrap),
		onSuccess: (_, values, submittedContext) => {
			if (submittedContext) clearDraftUnlessReplaced(submittedContext.contextKey, values);
			posthog?.capture(OrgDashboardEvents.FEEDBACK_SUBMITTED, {
				reason: values.reason,
				org_id: submittedContext?.orgId ?? orgId,
				page_path: submittedContext?.pathname ?? pathname,
			});
			toast.success("Your feedback has been saved. Thanks for helping us improve Clera.");
		},
		onError: (error) => {
			logger.error("Failed to submit org feedback", { error });
			toast.error("Your feedback couldn't be sent. Please try again.");
		},
	});
	return { ...mutation, context, contextKey };
}
