import { z } from "zod";

export const ResumeFeedbackSchema = z.object({
	overallScore: z.number(),
	strengths: z.array(z.string()),
	improvementAreas: z.array(
		z.object({
			issue: z.string(),
			suggestion: z.string(),
		}),
	),
	wordingSuggestions: z.array(
		z.object({
			original: z.string(),
			improved: z.string(),
		}),
	),
	atsOptimization: z.object({
		score: z.number(),
		suggestions: z.array(z.string()),
		summary: z.string(),
	}),
	summary: z.string(),
	error: z.string().optional(),
	raw: z.string().optional(),
});

export type ResumeFeedback = z.infer<typeof ResumeFeedbackSchema>;

export const PublicResumeFeedbackOutputSchema = z.object({
	feedback: ResumeFeedbackSchema,
});
