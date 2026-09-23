import { CLICK_ID_URL_PARAMS, UTM_URL_PARAMS } from "../constants.ts";
import { parseUtmFromSearchParams } from "../parse.ts";
import type { UtmParams } from "../types.ts";
import { getUtmFromSessionStorage, saveUtmToSessionStorage } from "./session-storage.ts";

export function stripUtmFromUrlString(href: string): string {
	const url = new URL(href);
	for (const param of [...UTM_URL_PARAMS, ...CLICK_ID_URL_PARAMS]) {
		url.searchParams.delete(param);
	}
	return url.toString();
}

export function stripUtmFromBrowserUrl(): void {
	if (typeof window === "undefined") return;
	getCurrentUtmParams();
	const stripped = stripUtmFromUrlString(window.location.href);
	if (stripped !== window.location.href) {
		window.history.replaceState(window.history.state, "", stripped);
	}
}

export function getUtmParamsFromBrowserUrl(): UtmParams | null {
	if (typeof window === "undefined") return null;
	const fields = parseUtmFromSearchParams(new URLSearchParams(window.location.search));
	if (!fields) return null;
	return {
		...fields,
		landingPage: window.location.pathname,
		referrer: typeof document !== "undefined" ? document.referrer || null : null,
	};
}

export function getCurrentUtmParams(): UtmParams | null {
	if (typeof window === "undefined") return null;
	const fromUrl = getUtmParamsFromBrowserUrl();
	if (fromUrl) {
		saveUtmToSessionStorage(fromUrl);
		return fromUrl;
	}
	return getUtmFromSessionStorage();
}
