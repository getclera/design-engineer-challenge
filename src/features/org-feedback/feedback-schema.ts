import { z } from "zod";
export const feedbackSchema = z.object({
	reason: z.enum(["bug", "missing_feature", "candidate_quality", "other"], {
		error: "Choose a reason for your feedback.",
	}),
	comment: z.string().trim().min(1, "Add a few details before sending."),
});

export type FeedbackValues = z.infer<typeof feedbackSchema>;
export type FeedbackDraft = Partial<FeedbackValues>;
