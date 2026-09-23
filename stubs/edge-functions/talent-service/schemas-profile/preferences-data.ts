import { z } from "zod";

export const PreferencesDataOutputSchema = z.object({
	roles: z.array(z.string()),
	jobTypes: z.array(z.string()),
	workEnvironment: z.array(z.string()),
	locations: z.array(z.string()),
	targetLocations: z.array(
		z.object({
			label: z.string(),
			lat: z.number().nullable(),
			lng: z.number().nullable(),
			radius: z.number().nullable(),
		}),
	),
	visaSponsorshipNeeded: z.boolean().nullable(),
	visaSponsorshipType: z.array(z.string()),
	visaSponsorshipFurtherDetails: z.string().nullable(),
	willingnessToRelocate: z.array(z.string()),
	salaryLowerBound: z.number().nullable(),
	salaryUpperBound: z.number().nullable(),
	salaryCurrency: z.string(),
	salaryImportance: z.string().nullable(),
	companySize: z.array(z.string()),
	companyStage: z.array(z.string()),
	industries: z.array(z.string()),
	blockedCompanies: z.array(z.string()),
	preferredJobComment: z.string().nullable(),
});
