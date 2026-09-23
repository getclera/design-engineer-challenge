export const orgFeedbackKeys = {
	all: ["org-feedback"] as const,
	submit: (orgId: string) => [...orgFeedbackKeys.all, "submit", orgId] as const,
};
