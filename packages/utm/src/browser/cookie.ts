import { resolveAttributionCookieWrites } from "../attribution.ts";
import {
	UTM_ATTRIBUTION_COOKIE_MAX_AGE_SECONDS,
	UTM_COOKIE_MAX_AGE_SECONDS,
	UTM_COOKIE_NAME,
	UTM_FIRST_TOUCH_COOKIE,
	UTM_LAST_TOUCH_COOKIE,
} from "../constants.ts";
import { decodeUtmCookie, encodeUtmCookie } from "../cookie-codec.ts";
import type { UtmParams, UtmParamsWithClickIds } from "../types.ts";

export function saveUtmToCookie(utmParams: UtmParams): void {
	if (typeof document === "undefined") return;
	try {
		const value = encodeUtmCookie(utmParams);
		const secure = window.location.protocol === "https:" ? "; Secure" : "";
		// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API isn't broadly supported in Safari yet, and we need the cookie set synchronously before the OAuth redirect fires.
		document.cookie = `${UTM_COOKIE_NAME}=${value}; path=/; max-age=${UTM_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
	} catch {
		// document.cookie not writable
	}
}

export function consumeUtmFromCookie(): UtmParamsWithClickIds | null {
	if (typeof document === "undefined") return null;
	try {
		const prefix = `${UTM_COOKIE_NAME}=`;
		const cookie = document.cookie.split("; ").find((c) => c.startsWith(prefix));
		if (!cookie) return null;
		const raw = cookie.slice(prefix.length);
		const parsed = decodeUtmCookie(raw);
		if (parsed) {
			// biome-ignore lint/suspicious/noDocumentCookie: clearing cookie synchronously
			document.cookie = `${UTM_COOKIE_NAME}=; path=/; max-age=0`;
		}
		return parsed;
	} catch {
		return null;
	}
}

export function getLastTouchUtmParams(): UtmParamsWithClickIds | null {
	if (typeof document === "undefined") return null;
	try {
		const prefix = `${UTM_LAST_TOUCH_COOKIE}=`;
		const cookie = document.cookie.split("; ").find((entry) => entry.startsWith(prefix));
		return cookie ? decodeUtmCookie(decodeURIComponent(cookie.slice(prefix.length))) : null;
	} catch {
		return null;
	}
}

function readAttributionCookie(name: string): string | undefined {
	const prefix = `${name}=`;
	const entry = document.cookie.split("; ").find((candidate) => candidate.startsWith(prefix));
	if (!entry) return undefined;
	try {
		return decodeURIComponent(entry.slice(prefix.length));
	} catch {
		return undefined;
	}
}

function writeAttributionCookie(name: string, value: string): void {
	const secure = window.location.protocol === "https:" ? "; Secure" : "";
	// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API isn't broadly supported in Safari yet, and the write must land before the visitor can navigate away.
	document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${UTM_ATTRIBUTION_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function captureAttributionInBrowser(): void {
	if (typeof document === "undefined" || typeof window === "undefined") return;

	const writes = resolveAttributionCookieWrites({
		searchParams: new URLSearchParams(window.location.search),
		pathname: window.location.pathname,
		hostname: window.location.hostname,
		referer: document.referrer || null,
		existingFirstTouch: readAttributionCookie(UTM_FIRST_TOUCH_COOKIE),
		existingLastTouch: readAttributionCookie(UTM_LAST_TOUCH_COOKIE),
	});
	if (!writes) return;

	if (writes.writeFirstTouch) writeAttributionCookie(UTM_FIRST_TOUCH_COOKIE, writes.value);
	if (writes.writeLastTouch) writeAttributionCookie(UTM_LAST_TOUCH_COOKIE, writes.value);
}
