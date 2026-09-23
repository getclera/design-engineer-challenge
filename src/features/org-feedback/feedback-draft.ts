import type { UseFormReturn } from "react-hook-form";
import type { FeedbackValues } from "./feedback-schema";
import { useOrgFeedbackDialog } from "./store";

export function subscribeToFeedbackDraft(
	form: Pick<UseFormReturn<FeedbackValues>, "watch" | "reset">,
	contextKey: string,
) {
	const subscription = form.watch((values) => {
		useOrgFeedbackDialog.getState().saveDraft(contextKey, { reason: values.reason, comment: values.comment ?? "" });
	});
	const unsubscribe = useOrgFeedbackDialog.subscribe((state, previous) => {
		if (previous.drafts[contextKey] && !state.drafts[contextKey]) form.reset({ comment: "", reason: undefined });
	});
	return () => {
		subscription.unsubscribe();
		unsubscribe();
	};
}
