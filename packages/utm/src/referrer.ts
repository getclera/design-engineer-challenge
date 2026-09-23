import { authRoutes } from "@clera/route-factory";
import { extractUrlHostname, sameRegistrableDomain } from "@clera/shared-utils";

const IDENTITY_PROVIDER_HOSTS = [
	"accounts.google.com",
	"login.microsoftonline.com",
	"appleid.apple.com",
	"clerk.accounts.dev",
];

const AUTH_CALLBACK_PATHS = [authRoutes.ssoCallback(), authRoutes.signinComplete(), authRoutes.oauthConsent()];

export function isAuthCallbackPath(pathname: string): boolean {
	return AUTH_CALLBACK_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isIdentityProvider(host: string): boolean {
	return IDENTITY_PROVIDER_HOSTS.some((provider) => host === provider || host.endsWith(`.${provider}`));
}

function isSelfHost(host: string, selfHost: string | null): boolean {
	if (!selfHost) return false;
	return host === selfHost || sameRegistrableDomain(host, selfHost);
}

export function externalReferrerDomain(
	referer: string | null | undefined,
	selfHost: string | null | undefined,
): string | null {
	const host = extractUrlHostname(referer);
	if (!host) return null;
	if (isIdentityProvider(host)) return null;
	return isSelfHost(host, extractUrlHostname(selfHost)) ? null : host;
}
