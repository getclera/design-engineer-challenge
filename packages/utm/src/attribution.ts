import { UTM_LANDING_PAGE_MAX_LENGTH } from "./constants.ts";
import { decodeUtmCookie, encodeUtmCookie } from "./cookie-codec.ts";
import { parseUtmWithClickIdsFromSearchParams } from "./parse.ts";
import { externalReferrerDomain, isAuthCallbackPath } from "./referrer.ts";

export interface AttributionLanding {
	searchParams: URLSearchParams;
	pathname: string;
	hostname: string;
	referer: string | null;
	existingFirstTouch: string | undefined;
	existingLastTouch: string | undefined;
}

export interface AttributionCookieWrites {
	value: string;
	writeFirstTouch: boolean;
	writeLastTouch: boolean;
}

export function resolveAttributionCookieWrites(landing: AttributionLanding): AttributionCookieWrites | null {
	const parsed = parseUtmWithClickIdsFromSearchParams(landing.searchParams);
	const referrer = isAuthCallbackPath(landing.pathname)
		? null
		: externalReferrerDomain(landing.referer, landing.hostname);
	if (!parsed && !referrer) return null;

	const hasFirstTouch = Boolean(landing.existingFirstTouch && decodeUtmCookie(landing.existingFirstTouch));
	const hasLastTouch = Boolean(landing.existingLastTouch && decodeUtmCookie(landing.existingLastTouch));

	return {
		value: encodeUtmCookie({
			...parsed,
			landingPage: landing.pathname.slice(0, UTM_LANDING_PAGE_MAX_LENGTH),
			referrer,
		}),
		writeFirstTouch: !hasFirstTouch,
		writeLastTouch: Boolean(parsed) || !hasLastTouch,
	};
}
