import { absoluteUrl, matchRoutes, talentRoutes } from "@clera/route-factory";
export const urnPattern = "(?:ACo|AEM)[A-Za-z0-9_-]{25,35}";

const SLUG_CHAR_PATTERN =
	// biome-ignore lint/suspicious/noMisleadingCharacterClass: zero-width chars matched individually, not as joiners
	/^[\p{L}\p{N}\p{So}._'~"\u200B\u200C\u200D\uFEFF\p{Emoji_Presentation}\p{Extended_Pictographic}\uFF08\uFF09-]+$/u;

const ZERO_WIDTH_PATTERN =
	// biome-ignore lint/suspicious/noMisleadingCharacterClass: zero-width chars stripped individually
	/[\u200B\u200C\u200D\uFEFF]/g;

export function normalizeLinkedInUrl(url: string): string {
	if (!url || !url.trim()) return "";

	let fullUrl = url.trim();

	try {
		fullUrl = decodeURIComponent(fullUrl);
	} catch {
		// Keep original if decoding fails
	}

	fullUrl = fullUrl.replace(/[\u2018\u2019\u201A\u201B]/g, "'");

	fullUrl = fullUrl.replace(/(\/in\/)\s+/, "$1");

	fullUrl = fullUrl.replace(/(\/in\/)([^?#]+)/, (_match, prefix, slug) => `${prefix}${slug.replace(/\s*-\s*/g, "-")}`);
	if (fullUrl.includes(" ")) return "";

	fullUrl = fullUrl.replace(/^https?:\/\/(?:www\.)?linkedin\.com\/+https?:\/{0,2}/i, "https://");

	fullUrl = fullUrl.replace(/^(https?)\/\//i, "$1://");

	fullUrl = fullUrl.replace(/^(https?:\/\/)+/i, "https://");
	fullUrl = fullUrl.replace(/^https:\/\/http:\/\//i, "https://");
	fullUrl = fullUrl.replace(/^http:\/\/https:\/\//i, "https://");
	fullUrl = fullUrl.replace(/^https:\/\/www\.https\/www\./i, "https://www.");
	fullUrl = fullUrl.replace(/^https:\/\/www\.(https?)\/www\./i, "https://www.");

	if (!fullUrl.match(new RegExp(`(?:^|\\/)in\\/(${urnPattern})`))) {
		fullUrl = fullUrl.toLowerCase();
	}

	if (fullUrl.startsWith("http://") || fullUrl.startsWith("https://")) {
		fullUrl = fullUrl.replace("http://", "https://");
		if (!fullUrl.includes("www.")) {
			fullUrl = fullUrl.replace("https://", "https://www.");
		}
	} else if (fullUrl.startsWith("www.")) {
		fullUrl = `https://${fullUrl}`;
	} else if (fullUrl.startsWith("/in/")) {
		fullUrl = `https://www.linkedin.com${fullUrl}`;
	} else if (fullUrl.startsWith("in/")) {
		fullUrl = `https://www.linkedin.com/${fullUrl}`;
	} else if (fullUrl === "linkedin.com" || fullUrl === "www.linkedin.com") {
		return "";
	} else if (fullUrl.startsWith("linkedin.com/")) {
		fullUrl = `https://www.${fullUrl}`;
	} else if (fullUrl.includes("/in/")) {
		const path = fullUrl.startsWith("/") ? fullUrl.slice(1) : fullUrl;
		fullUrl = `https://www.linkedin.com/${path}`;
	} else if (fullUrl.startsWith("/")) {
		const username = fullUrl.slice(1);
		const cleanUsername = username.replace(/^\/+/, "").replace(/^in\//, "");
		const isValidUsername = SLUG_CHAR_PATTERN.test(cleanUsername);
		const isUrnPatternMatch = new RegExp(`^${urnPattern}$`).test(cleanUsername);
		if (!isValidUsername && !isUrnPatternMatch) return "";
		fullUrl = `https://www.linkedin.com/in/${cleanUsername}`;
	} else if (!fullUrl.includes("linkedin.com")) {
		const cleanUsername = fullUrl.replace(/^\/+/, "").replace(/^in\//, "");
		const isValidUsername = SLUG_CHAR_PATTERN.test(cleanUsername);
		const isUrnPattern = new RegExp(`^${urnPattern}$`).test(cleanUsername);
		if (!isValidUsername && !isUrnPattern) return "";
		fullUrl = `https://www.linkedin.com/in/${cleanUsername}`;
	} else {
		if (!fullUrl.includes("www.")) {
			fullUrl = fullUrl.replace("https://linkedin.com", "https://www.linkedin.com");
			fullUrl = fullUrl.replace("http://linkedin.com", "https://www.linkedin.com");
		}
		const pathAfterDomain = fullUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\//, "");
		if (pathAfterDomain && !pathAfterDomain.startsWith("in/") && !pathAfterDomain.startsWith("/in/")) {
			fullUrl = `https://www.linkedin.com/in/${pathAfterDomain.replace(/^\/+/, "")}`;
		} else {
			fullUrl = `https://www.linkedin.com/${pathAfterDomain}`;
		}
	}

	try {
		const urlObj = new URL(fullUrl);
		let pathname = urlObj.pathname.replace(/\/+/g, "/");

		try {
			pathname = decodeURIComponent(pathname);
		} catch {
			// Keep original if decoding fails
		}

		const profileMatch = pathname.match(/^(\/in\/[^/]+)/);
		if (profileMatch) {
			pathname = profileMatch[1];
		} else {
			const segments = pathname.split("/").filter(Boolean);
			if (segments.length === 1 && segments[0] !== "in" && isValidLinkedInSlug(segments[0])) {
				pathname = `/in/${segments[0]}`;
			} else {
				return "";
			}
		}

		pathname = pathname.replace(/\/+$/, "");
		const host = "www.linkedin.com";
		return `${urlObj.protocol}//${host}${pathname}`;
	} catch {
		const profileMatch = fullUrl.match(/\/in\/([^/?#]+)/);
		if (profileMatch) {
			let identifier = profileMatch[1];
			try {
				identifier = decodeURIComponent(identifier);
			} catch {
				// Keep original
			}
			return `https://www.linkedin.com/in/${identifier}`;
		}
		return fullUrl.replace(/([^:]\/)\/+/g, "$1").replace(/https?:\/\/(?!www\.)/, "https://www.");
	}
}

export function isValidLinkedInSlug(slug: string | null | undefined): boolean {
	if (!slug) return false;
	const trimmed = slug.trim().replace(/[\u2018\u2019\u201A\u201B]/g, "'");
	if (trimmed.length < 2 || trimmed.length > 100) return false;
	if (trimmed.includes("%")) return false;
	if (/\s/.test(trimmed)) return false;
	if (/^\+[0-9]+$/.test(trimmed)) return false;
	const visible = trimmed.replace(ZERO_WIDTH_PATTERN, "");
	if (visible.length < 1) return false;
	return SLUG_CHAR_PATTERN.test(trimmed);
}

export function extractPublicIdentifier(linkedinUrl: string): string | null {
	try {
		const normalizedUrl = normalizeLinkedInUrl(linkedinUrl);
		if (!normalizedUrl || normalizedUrl.trim() === "") return null;

		const urlObj = new URL(normalizedUrl);
		const path = urlObj.pathname;
		const matches = path.match(/\/in\/([^/]+)/);
		if (!matches || !matches[1]) {
			const pathSegments = path.split("/").filter(Boolean);
			if (pathSegments.length > 0 && pathSegments[0] !== "in") {
				const potentialIdentifier = pathSegments[pathSegments.length - 1];
				if (potentialIdentifier && potentialIdentifier.length > 0) {
					let candidate: string;
					try {
						candidate = decodeURIComponent(potentialIdentifier);
					} catch {
						candidate = potentialIdentifier;
					}
					return isValidLinkedInSlug(candidate) ? candidate : null;
				}
			}
			return null;
		}
		let identifier: string;
		try {
			identifier = decodeURIComponent(matches[1]);
		} catch {
			identifier = matches[1];
		}
		return isValidLinkedInSlug(identifier) ? identifier : null;
	} catch {
		return null;
	}
}

export function extractLinkedInSlug(input: string | null): string | null {
	if (!input) return null;
	const url = input.trim();
	if (/^[\p{L}\p{N}\-_.]+$/u.test(url) && !url.includes("@")) {
		const safe = url.toLowerCase().replace(/[^\p{L}\p{N}\-_]/gu, "");
		return safe || null;
	}
	try {
		const normalized = normalizeLinkedInUrl(url);
		const urlObj = new URL(normalized);
		const path = urlObj.pathname;
		const matches = path.match(/\/in\/([^/]+)/);
		let slug = matches?.[1];
		if (!slug) {
			const segments = path.split("/").filter(Boolean);
			if (segments.length > 0) {
				slug = segments[segments.length - 1];
			}
		}
		if (slug) {
			try {
				slug = decodeURIComponent(slug);
			} catch {
				// Keep original if decoding fails
			}
			const safe = slug.toLowerCase().replace(/[^\p{L}\p{N}\-_]/gu, "");
			return safe || null;
		}
		return null;
	} catch (_e) {
		const fallback = url.match(/in\/([^/?#]+)/);
		if (fallback?.[1]) {
			const safe = fallback[1].toLowerCase().replace(/[^\p{L}\p{N}\-_]/gu, "");
			return safe || null;
		}
		return null;
	}
}

function extractSlugForOpportunityLink(input: string | null): string | null {
	if (!input) return null;
	const url = input.trim();

	if (/^[\p{L}\p{N}\-_.']+$/u.test(url) && !url.includes("@")) {
		const safe = url.toLowerCase().replace(/[^\p{L}\p{N}\-_']/gu, "");
		return safe || null;
	}

	try {
		const normalized = normalizeLinkedInUrl(url);
		const urlObj = new URL(normalized);
		const path = urlObj.pathname;
		const matches = path.match(/\/in\/([^/]+)/);
		let slug = matches?.[1];

		if (!slug) {
			const segments = path.split("/").filter(Boolean);
			if (segments.length > 0) slug = segments[segments.length - 1];
		}

		if (slug) {
			try {
				slug = decodeURIComponent(slug);
			} catch {
				// Keep original
			}
			const safe = slug.toLowerCase().replace(/[^\p{L}\p{N}\-_]/gu, "");
			return safe || null;
		}
		return null;
	} catch {
		const fallback = url.match(/in\/([^/?#]+)/);
		if (fallback?.[1]) {
			const safe = fallback[1].toLowerCase().replace(/[^\p{L}\p{N}\-_]/gu, "");
			return safe || null;
		}
		return null;
	}
}

export function generateOpportunityLink(
	nanoId: string,
	linkedinUrl: string | null,
	opts?: { useMatchLink?: boolean },
): string {
	if (opts?.useMatchLink) {
		return absoluteUrl(matchRoutes.page(nanoId));
	}
	return absoluteUrl(talentRoutes.profile(nanoId, extractSlugForOpportunityLink(linkedinUrl)));
}

export function sortExperiencesByRecency<
	T extends {
		start_date?: string | null;
		end_date?: string | null;
		is_current?: boolean;
		months_experience?: number;
	},
>(experiences: T[]): T[] {
	if (!experiences || experiences.length === 0) return [];

	return experiences.slice().sort((a, b) => {
		const getEffectiveEndDate = (exp: T): Date => {
			if (exp.is_current || !exp.end_date) return new Date();
			return new Date(exp.end_date);
		};

		const endDateA = getEffectiveEndDate(a);
		const endDateB = getEffectiveEndDate(b);
		const endDateDiff = endDateB.getTime() - endDateA.getTime();
		if (endDateDiff !== 0) return endDateDiff;

		const startDateA = a.start_date ? new Date(a.start_date).getTime() : 0;
		const startDateB = b.start_date ? new Date(b.start_date).getTime() : 0;
		return startDateB - startDateA;
	});
}

export function isValidLinkedInUrl(url: string): boolean {
	if (!url || !url.trim()) return false;

	try {
		const normalized = normalizeLinkedInUrl(url);
		if (!normalized) return false;

		const urlObj = new URL(normalized);
		if (!urlObj.hostname.includes("linkedin.com")) return false;
		if (!urlObj.pathname.includes("/in/")) return false;

		const match = urlObj.pathname.match(/\/in\/([^/]+)/);
		if (!match || !match[1] || match[1].length < 2) return false;

		const username = match[1];
		if (username.toLowerCase().includes("placeholder")) return false;

		return true;
	} catch {
		return false;
	}
}

export function isLinkedInProfileUrl(url: string | null | undefined): boolean {
	if (!url) return false;
	const trimmed = url.trim();
	if (!/^(?:https?:\/\/)?(?:www\.)?linkedin\.com\//i.test(trimmed)) return false;
	if (!/(?:^|\/)in\/[^/?#]+/i.test(trimmed)) return false;
	return isValidLinkedInUrl(trimmed);
}

export function normalizeLinkedInCompanyUrl(url: string): string {
	if (!url || !url.trim()) return "";

	let fullUrl = url.trim();

	try {
		fullUrl = decodeURIComponent(fullUrl);
	} catch {
		// Keep original if decoding fails (malformed encoding)
	}

	if (fullUrl.includes(" ")) return "";

	fullUrl = fullUrl.replace(/^(https?:\/\/)+/i, "https://");
	fullUrl = fullUrl.replace(/^https:\/\/http:\/\//i, "https://");
	fullUrl = fullUrl.replace(/^http:\/\/https:\/\//i, "https://");
	fullUrl = fullUrl.replace(/^https:\/\/www\.https\/www\./i, "https://www.");
	fullUrl = fullUrl.replace(/^https:\/\/www\.(https?)\/www\./i, "https://www.");

	fullUrl = fullUrl.toLowerCase();

	if (fullUrl.startsWith("http://") || fullUrl.startsWith("https://")) {
		fullUrl = fullUrl.replace("http://", "https://");
		if (!fullUrl.includes("www.")) {
			fullUrl = fullUrl.replace("https://", "https://www.");
		}
	} else if (fullUrl.startsWith("www.")) {
		fullUrl = `https://${fullUrl}`;
	} else if (fullUrl.startsWith("/company/")) {
		fullUrl = `https://www.linkedin.com${fullUrl}`;
	} else if (fullUrl.startsWith("company/")) {
		fullUrl = `https://www.linkedin.com/${fullUrl}`;
	} else if (fullUrl === "linkedin.com" || fullUrl === "www.linkedin.com") {
		return "";
	} else if (fullUrl.startsWith("linkedin.com/")) {
		fullUrl = `https://www.${fullUrl}`;
	} else if (fullUrl.includes("/company/")) {
		const path = fullUrl.startsWith("/") ? fullUrl.slice(1) : fullUrl;
		fullUrl = `https://www.linkedin.com/${path}`;
	} else if (!fullUrl.includes("linkedin.com")) {
		const cleanSlug = fullUrl.replace(/^\/+/, "").replace(/^company\//, "");
		const isValidSlug = /^[\p{L}\p{N}._-]+$/u.test(cleanSlug);
		if (!isValidSlug) return "";
		fullUrl = `https://www.linkedin.com/company/${cleanSlug}`;
	} else {
		if (!fullUrl.includes("www.")) {
			fullUrl = fullUrl.replace("https://linkedin.com", "https://www.linkedin.com");
			fullUrl = fullUrl.replace("http://linkedin.com", "https://www.linkedin.com");
		}
		const pathAfterDomain = fullUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\//, "");
		if (pathAfterDomain && !pathAfterDomain.startsWith("company/")) {
			fullUrl = `https://www.linkedin.com/company/${pathAfterDomain.replace(/^\/+/, "")}`;
		} else {
			fullUrl = `https://www.linkedin.com/${pathAfterDomain}`;
		}
	}

	try {
		const urlObj = new URL(fullUrl);
		const pathname = urlObj.pathname.replace(/\/+/g, "/");
		const match = pathname.match(/^\/company\/([^/]+)/);
		if (!match?.[1]) return "";
		return `https://www.linkedin.com/company/${match[1]}`;
	} catch {
		return "";
	}
}

export function extractCompanySlug(linkedinUrl: string): string | null {
	const normalized = normalizeLinkedInCompanyUrl(linkedinUrl);
	if (!normalized) return null;
	const match = normalized.match(/\/company\/([^/]+)/);
	return match?.[1] ?? null;
}
