"use client";
import { FormFieldGroup, RadioListField } from "@v2/components/forms";
import { Textarea } from "@v2/components/ui/textarea";
import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { getFeedbackPageContext } from "./feedback-context";
import { subscribeToFeedbackDraft } from "./feedback-draft";
import type { FeedbackValues } from "./feedback-schema";

const FOLLOW_UP = {
	bug: { label: "What happened?", placeholder: "What were you trying to do, and what happened instead?" },
	missing_feature: {
		label: "What would you like to do?",
		placeholder: "Describe the task you wish Clera could help with.",
	},
	candidate_quality: {
		label: "What could be a better fit?",
		placeholder: "Which skills, experience, or preferences are missing from your matches?",
	},
	other: { label: "What would you like to share?", placeholder: "A few details will help us understand." },
};

const REASON_OPTIONS = [
	{ value: "bug", label: "Bug report", description: "Something isn't working" },
	{ value: "missing_feature", label: "Missing feature", description: "An idea for something new" },
	{ value: "candidate_quality", label: "Candidate quality", description: "Help us improve your matches" },
	{ value: "other", label: "Something else", description: "Anything you'd like to share" },
];

interface OrgFeedbackFieldsProps {
	form: UseFormReturn<FeedbackValues>;
	contextKey: string;
	context: ReturnType<typeof getFeedbackPageContext>;
	disabled: boolean;
}
export function OrgFeedbackFields({ form, contextKey, context, disabled }: OrgFeedbackFieldsProps) {
	useEffect(() => subscribeToFeedbackDraft(form, contextKey), [form, contextKey]);
	return (
		<>
			<RadioListField
				control={form.control}
				name="reason"
				label="What's on your mind?"
				options={REASON_OPTIONS}
				variant="cards"
				disabled={disabled}
			/>
			<FormFieldGroup
				control={form.control}
				name="comment"
				label={FOLLOW_UP[form.watch("reason")]?.label ?? "Tell us a little more"}
				required
			>
				{(field) => (
					<Textarea
						{...field}
						tone="warm"
						placeholder={FOLLOW_UP[form.watch("reason")]?.placeholder ?? "Choose a reason, then add a few details."}
						className="min-h-45 bg-v2-bg-page text-base md:min-h-32"
						disabled={disabled}
					/>
				)}
			</FormFieldGroup>
			<div className="space-y-1 text-xs leading-relaxed text-v2-text-secondary">
				<details>
					<summary className="cursor-pointer py-2">
						{context.roleId ? "Included: this page and the selected role" : "Included: this page"}
					</summary>
					<p className="break-all pb-2">{context.pagePath}</p>
				</details>
				<p>Your draft stays on this page if you close this window.</p>
			</div>
		</>
	);
}
OrgFeedbackFields.displayName = "OrgFeedbackFields";
