import { z } from "zod";

export const externalTalentFiltersSchema = z
	.object({
		keywords: z.string().trim().min(1).max(200).optional(),
		titles: z.array(z.string().trim().min(1).max(120)).max(10).optional(),
		locations: z.array(z.string().trim().min(1).max(120)).max(10).optional(),
		countries: z
			.array(z.string().trim().min(1).max(120))
			.max(10)
			.optional()
			.describe(
				"ISO 3166-1 alpha-2 codes such as US, DE or CA. Country names do not match anything. Set this whenever the role has a home market; without it the search covers the whole world.",
			),
		industries: z.array(z.string().trim().min(1).max(120)).max(10).optional(),
		skills: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
		seniorities: z.array(z.string().trim().min(1).max(60)).max(10).optional(),
		minYearsExperience: z.number().int().min(0).max(60).optional(),
		maxYearsExperience: z.number().int().min(0).max(60).optional(),
	})
	.refine(
		(filters) =>
			filters.minYearsExperience === undefined ||
			filters.maxYearsExperience === undefined ||
			filters.minYearsExperience <= filters.maxYearsExperience,
		{ message: "minYearsExperience must be less than or equal to maxYearsExperience", path: ["minYearsExperience"] },
	)
	.refine((filters) => Object.values(filters).some((value) => value !== undefined), {
		message: "At least one filter is required",
	});

export type ExternalTalentFilters = z.infer<typeof externalTalentFiltersSchema>;

const externalTalentChipSchema = z.object({ name: z.string(), logoUrl: z.string().nullable() });

const externalTalentExperienceSchema = z.object({
	title: z.string().nullable(),
	company: z.string(),
	logoUrl: z.string().nullable(),
	startYear: z.number().nullable(),
	endYear: z.number().nullable(),
	isCurrent: z.boolean(),
});

export const externalTalentProfileSchema = z.object({
	linkedinUrl: z.string().nullable(),
	fullName: z.string().nullable(),
	headline: z.string().nullable(),
	avatarUrl: z.string().nullable(),
	currentCompany: z.string().nullable(),
	currentPosition: z.string().nullable(),
	locationName: z.string().nullable(),
	industry: z.string().nullable(),
	totalExperienceYears: z.number().nullable(),
	companies: z.array(externalTalentChipSchema).default([]),
	school: externalTalentChipSchema.nullable().default(null),
	education: z
		.array(
			z.object({
				school: z.string().nullable(),
				degree: z.string().nullable(),
				field: z.string().nullable(),
				logoUrl: z.string().nullable().default(null),
				startYear: z.number().nullable().default(null),
				endYear: z.number().nullable().default(null),
			}),
		)
		.default([]),
	skills: z.array(z.string()).default([]),
	summary: z.string().nullable().default(null),
	experiences: z.array(externalTalentExperienceSchema).default([]),
});

export type ExternalTalentChip = z.infer<typeof externalTalentChipSchema>;

export type ExternalTalentExperience = z.infer<typeof externalTalentExperienceSchema>;

export type ExternalTalentProfile = z.infer<typeof externalTalentProfileSchema>;

export function parseExternalTalentProfiles(raw: readonly unknown[]): ExternalTalentProfile[] {
	return raw.map((entry) => externalTalentProfileSchema.parse(entry));
}

export const externalTalentFilterFieldSchema = z.object({
	field: z.string(),
	valueType: z.string(),
	supportsTopValues: z.boolean(),
});

export const externalTalentFilterValueSchema = z.object({
	value: z.string(),
	count: z.number().int().min(0),
});
