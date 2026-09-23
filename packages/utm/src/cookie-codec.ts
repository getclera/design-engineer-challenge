import { pickUtmParamsWithClickIds } from "./pick-utm.ts";
import type { UtmParamsWithClickIds } from "./types.ts";

export function encodeUtmCookie(params: UtmParamsWithClickIds): string {
	return encodeURIComponent(JSON.stringify(params));
}

export function decodeUtmCookie(raw: string): UtmParamsWithClickIds | null {
	try {
		return pickUtmParamsWithClickIds(JSON.parse(decodeURIComponent(raw)));
	} catch {
		return null;
	}
}
