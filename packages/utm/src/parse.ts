import { pickUtmParams } from "./pick-utm.ts";
import type { UtmFields, UtmParams } from "./types.ts";

function lower(value: string | null): string | null {
	return value ? value.toLowerCase() : null;
}

export function parseUtmFromSearchParams(searchParams: URLSearchParams): UtmFields | null {
	const utmSource = lower(searchParams.get("utm_source"));
	const utmMedium = lower(searchParams.get("utm_medium"));
	const utmCampaign = lower(searchParams.get("utm_campaign"));
	const utmContent = lower(searchParams.get("utm_content"));
	const utmTerm = lower(searchParams.get("utm_term"));

	if (!utmSource && !utmMedium && !utmCampaign && !utmContent && !utmTerm) {
		return null;
	}

	return { utmSource, utmMedium, utmCampaign, utmContent, utmTerm };
}

export function parseUtmWithClickIdsFromSearchParams(
	searchParams: URLSearchParams,
): (UtmFields & { gclid: string | null; fbclid: string | null; msclkid: string | null }) | null {
	const utm = parseUtmFromSearchParams(searchParams);
	const gclid = searchParams.get("gclid");
	const fbclid = searchParams.get("fbclid");
	const msclkid = searchParams.get("msclkid");

	if (!utm && !gclid && !fbclid && !msclkid) return null;

	return {
		...(utm ?? { utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null, utmTerm: null }),
		gclid,
		fbclid,
		msclkid,
	};
}

export function parseUtmParamsJson(raw: string): UtmParams | null {
	try {
		return pickUtmParams(JSON.parse(raw));
	} catch {
		return null;
	}
}

export function parseUtmFromUrlEncoded(encoded: string): UtmFields | null {
	if (!encoded) return null;
	const sp = new URLSearchParams(encoded);
	return parseUtmFromSearchParams(sp);
}
