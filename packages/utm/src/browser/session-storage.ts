import { UTM_SESSIONSTORAGE_KEY } from "../constants.ts";
import { parseUtmParamsJson } from "../parse.ts";
import type { UtmParams } from "../types.ts";

export function saveUtmToSessionStorage(utmParams: UtmParams): void {
	if (typeof sessionStorage === "undefined") return;
	try {
		sessionStorage.setItem(UTM_SESSIONSTORAGE_KEY, JSON.stringify(utmParams));
	} catch {
		// sessionStorage not available
	}
}

export function getUtmFromSessionStorage(): UtmParams | null {
	if (typeof sessionStorage === "undefined") return null;
	try {
		const raw = sessionStorage.getItem(UTM_SESSIONSTORAGE_KEY);
		if (!raw) return null;
		return parseUtmParamsJson(raw);
	} catch {
		return null;
	}
}
