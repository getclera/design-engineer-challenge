export function sanitizeRouteParam(raw: string): string {
	return raw.split(/[&?]/)[0];
}

interface ExtractUrlHostnameOptions {
	stripWww?: boolean;
}

export function extractUrlHostname(
	url: string | null | undefined,
	options: ExtractUrlHostnameOptions = {},
): string | null {
	if (!url) return null;
	const { stripWww = true } = options;
	try {
		const normalized = /^[a-z][a-z\d+\-.]*:\/\//i.test(url) ? url : `https://${url}`;
		const u = new URL(normalized);
		const host = stripWww ? u.hostname.replace(/^www\./i, "") : u.hostname;
		return host || null;
	} catch {
		return null;
	}
}

export function extractUrlPath(input: string | null | undefined): string {
	if (!input) return "";
	const trimmed = input.trim();
	if (!trimmed) return "";
	try {
		return new URL(trimmed).pathname;
	} catch {
		const withoutQuery = trimmed.split("?")[0].split("#")[0];
		return withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
	}
}

export function isHttpUrl(value: string | null | undefined): value is string {
	if (!value || !URL.canParse(value)) return false;
	const { protocol } = new URL(value);
	return protocol === "https:" || protocol === "http:";
}

export function stripUrlScheme(url: string): string {
	return url.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(email: string): boolean {
	return EMAIL_RE.test(email);
}

const PLACEHOLDER_EMAIL_RE = /^email\d+@/;
export function isPlaceholderEmail(email: string): boolean {
	const v = email.trim().toLowerCase();
	return PLACEHOLDER_EMAIL_RE.test(v) || v.includes("*");
}

const REGISTRY_LABEL = /^(com|co|net|org|edu|gov|gob|govt|ac|or|ne|go|sch|id|me|nom|mil|web|ind|firm|gen)$/;

function isPublicSuffixPair(labels: string[]): boolean {
	if (labels.length !== 2) return false;
	const [registry, tld] = labels;
	return tld.length === 2 && REGISTRY_LABEL.test(registry);
}

export function registrableDomain(url: string | null | undefined): string | null {
	const host = extractUrlHostname(url);
	if (!host) return null;
	if (host.includes(":") || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
	const labels = host.toLowerCase().split(".").filter(Boolean);
	if (labels.length < 2) return null;

	const want = isPublicSuffixPair(labels.slice(-2)) ? 3 : 2;
	return labels.slice(-Math.min(want, labels.length)).join(".");
}

export function sameRegistrableDomain(a: string | null | undefined, b: string | null | undefined): boolean {
	const da = registrableDomain(a);
	const db = registrableDomain(b);
	return da !== null && db !== null && da === db;
}

const NON_CANONICAL_HOSTS = new Set([
	"bit.ly",
	"tinyurl.com",
	"goo.gl",
	"ow.ly",
	"t.co",
	"lnkd.in",
	"itx.to",
	"rebrand.ly",
	"cutt.ly",
	"buff.ly",
	"shorturl.at",
	"rb.gy",
	"is.gd",
	"linkedin.com",
	"facebook.com",
	"instagram.com",
	"twitter.com",
	"x.com",
	"youtube.com",
	"tiktok.com",
	"pinterest.com",
	"medium.com",
	"wa.me",
	"linktr.ee",
	"beacons.ai",
	"carrd.co",
	"bio.link",
	"campsite.bio",
	"sites.google.com",
	"docs.google.com",
	"forms.gle",
	"notion.site",
]);

export function isCanonicalCompanyWebsite(url: string | null | undefined): boolean {
	const domain = registrableDomain(url);
	if (!domain) return false;
	const host = extractUrlHostname(url)?.toLowerCase();
	if (host && NON_CANONICAL_HOSTS.has(host)) return false;
	return !NON_CANONICAL_HOSTS.has(domain);
}
