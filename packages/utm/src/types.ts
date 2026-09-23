import type { z } from "zod";
import type { UtmFieldsSchema, UtmParamsSchema, UtmParamsWithClickIdsSchema } from "./schemas.ts";

export type UtmFields = z.infer<typeof UtmFieldsSchema>;
export type UtmParams = z.infer<typeof UtmParamsSchema>;
export type UtmParamsWithClickIds = z.infer<typeof UtmParamsWithClickIdsSchema>;

export type AttributionTouch = {
	params: UtmParams;
	timestamp: string;
	touchType: "first" | "last";
};

export type TrackingCode = {
	code: string;
	params: UtmParams;
	createdAt: string;
	resolvedAt: string | null;
	talentId: string | null;
};

export type PartnerAttribution = {
	source: string;
	utmSource: string;
	utmMedium: string;
	utmCampaign: string;
	utmContent: string;
};
