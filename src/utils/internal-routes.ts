const INTERNAL_APP_PATH_PREFIXES = ["/admin", "/recruiter", "/organization"];

export function isInternalAppPath(pathname: string): boolean {
	return INTERNAL_APP_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

// Long-tail SEO templates where third-party/observability JS must wait for a real
// interaction — a timer fallback lands mid-LCP on throttled mobile (CLW-5993).
const SEO_PUBLIC_PATH_PREFIXES = ["/jobs", "/companies", "/blog", "/investors", "/map", "/case-studies", "/visa"];

export function isSeoPublicPath(pathname: string | null): boolean {
	if (!pathname) return false;
	return SEO_PUBLIC_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

const PRIVATE_NESTED_PATH_SEGMENTS = ["/drops/", "/review/"];

const CDN_CACHEABLE_EXACT_PATHS = new Set(["/", "/sitemap.xml", "/llms.txt", "/hire", "/terms", "/privacy", "/faq"]);

export function isCdnCacheablePublicPath(pathname: string | null): boolean {
	if (!pathname) return false;
	if (PRIVATE_NESTED_PATH_SEGMENTS.some((segment) => pathname.includes(segment))) return false;
	return CDN_CACHEABLE_EXACT_PATHS.has(pathname) || isSeoPublicPath(pathname);
}

const EAGER_AUTH_PATH_PREFIXES = [
	...INTERNAL_APP_PATH_PREFIXES,
	"/dashboard",
	"/chat",
	"/onboarding",
	"/auth",
	"/login",
	"/signin",
	"/signup",
	"/sso-callback",
	"/create-organization",
];

export function isEagerAuthPath(pathname: string | null): boolean {
	if (!pathname) return true;
	return EAGER_AUTH_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
