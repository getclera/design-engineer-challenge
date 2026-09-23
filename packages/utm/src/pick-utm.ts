import type { UtmFields, UtmParams, UtmParamsWithClickIds } from "./types.ts";

export const UTM_FIELD_KEYS = [
	"utmSource",
	"utmMedium",
	"utmCampaign",
	"utmContent",
	"utmTerm",
] as const satisfies readonly (keyof UtmFields)[];

export const UTM_PARAM_KEYS = [
	...UTM_FIELD_KEYS,
	"landingPage",
	"referrer",
] as const satisfies readonly (keyof UtmParams)[];

const CLICK_ID_FIELDS = ["gclid", "fbclid", "msclkid"] as const satisfies readonly (keyof UtmParamsWithClickIds)[];

function pickNullableStringFields<T extends object>(value: unknown, fields: readonly (keyof T & string)[]): T | null {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
	const record = value as Record<string, unknown>;
	const picked: Record<string, string | null> = {};
	for (const field of fields) {
		if (!(field in record)) continue;
		const fieldValue = record[field];
		if (fieldValue === undefined) continue;
		if (fieldValue !== null && typeof fieldValue !== "string") return null;
		picked[field] = fieldValue;
	}
	return picked as T;
}

export function pickUtmParams(value: unknown): UtmParams | null {
	return pickNullableStringFields<UtmParams>(value, UTM_PARAM_KEYS);
}

export function pickUtmParamsWithClickIds(value: unknown): UtmParamsWithClickIds | null {
	return pickNullableStringFields<UtmParamsWithClickIds>(value, [...UTM_PARAM_KEYS, ...CLICK_ID_FIELDS]);
}
