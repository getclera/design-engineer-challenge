"use client";

import { FormDialog } from "@v2/components/forms";
import { useCallback, useRef } from "react";
import { feedbackSchema } from "./feedback-schema";
import { useSubmitOrgFeedback } from "./hooks/use-submit-org-feedback";
import { OrgFeedbackFields } from "./org-feedback-fields";
import { useOrgFeedbackDialog } from "./store";

interface OrgFeedbackDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function OrgFeedbackDialog({ open, onOpenChange }: OrgFeedbackDialogProps) {
	const mutation = useSubmitOrgFeedback();
	const currentContextKey = useRef(mutation.contextKey);
	currentContextKey.current = mutation.contextKey;
	const handleOpenChange = useCallback(
		(next: boolean) => {
			if (!mutation.isPending) onOpenChange(next);
		},
		[mutation.isPending, onOpenChange],
	);

	return (
		<FormDialog
			key={mutation.contextKey}
			appearance="warm"
			preserveDraftOnClose
			open={open}
			onOpenChange={handleOpenChange}
			title="Share feedback"
			description="Tell us what's not working. The more specific, the faster we can fix it."
			schema={feedbackSchema}
			defaultValues={useOrgFeedbackDialog.getState().drafts[mutation.contextKey] ?? { comment: "" }}
			onSubmit={(values) =>
				mutation.mutate(values, {
					onSuccess: () => {
						if (currentContextKey.current !== mutation.contextKey) return;
						onOpenChange(false);
					},
				})
			}
			isSubmitting={mutation.isPending}
			submitLabel="Send feedback"
			submittingLabel="Sending..."
			cancelLabel="Close"
			bodyClassName="space-y-6"
		>
			{(form) => (
				<OrgFeedbackFields
					form={form}
					contextKey={mutation.contextKey}
					context={mutation.context}
					disabled={mutation.isPending}
				/>
			)}
		</FormDialog>
	);
}

OrgFeedbackDialog.displayName = "OrgFeedbackDialog";
