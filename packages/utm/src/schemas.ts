import { z } from "zod";

export const UtmFieldsSchema = z.object({
	utmSource: z.string().nullable().optional(),
	utmMedium: z.string().nullable().optional(),
	utmCampaign: z.string().nullable().optional(),
	utmContent: z.string().nullable().optional(),
	utmTerm: z.string().nullable().optional(),
});

export const UtmParamsSchema = UtmFieldsSchema.extend({
	landingPage: z.string().nullable().optional(),
	referrer: z.string().nullable().optional(),
});

export const UtmParamsWithClickIdsSchema = UtmParamsSchema.extend({
	gclid: z.string().nullable().optional(),
	fbclid: z.string().nullable().optional(),
	msclkid: z.string().nullable().optional(),
});

export const TrackRequestSchema = UtmParamsSchema.refine(
	(data) => Boolean(data.utmSource || data.utmMedium || data.utmCampaign || data.utmContent || data.utmTerm),
	{ message: "At least one UTM parameter is required" },
);
