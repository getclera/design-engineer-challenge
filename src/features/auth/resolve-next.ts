import { authRoutes, marketingRoutes, talentDashboardRoutes } from "@clera/route-factory";
import { AUTH_NEXT_COOKIE } from "./constants";
import { isClerkOauthAuthorizeNext, isOauthContinuationNext, oauthConsentNextFromRedirectUrl } from "./next-target";

const URL_CONTROL_CHARACTERS = /[\t\n\r]/;
const RELATIVE_BASE = "https://relative.invalid";

export function isSafeRelativeNext(candidate: string): boolean {
	if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.startsWith("/\\")) return false;
	if (URL_CONTROL_CHARACTERS.test(candidate)) return false;
	try {
		return new URL(candidate, RELATIVE_BASE).origin === RELATIVE_BASE;
	} catch {
		return false;
	}
}

export function resolveLoginCallbackNext(params: Pick<URLSearchParams, "get">): string {
	const redirect = params.get("redirect");
	if (redirect && isSafeRelativeNext(redirect)) return redirect;
	const clerkReturn = params.get("redirect_url");
	if (clerkReturn) {
		if (isClerkOauthAuthorizeNext(clerkReturn)) return clerkReturn;
		const consentNext = oauthConsentNextFromRedirectUrl(clerkReturn);
		if (consentNext) return consentNext;
	}
	return authRoutes.login();
}

interface ResolveNextInput {
	queryNext: string | null;
	cookieNext: string | null;
}

export function resolveNextTarget({ queryNext, cookieNext }: ResolveNextInput): string {
	const rawNext = queryNext ?? cookieNext ?? talentDashboardRoutes.home();
	return isSafeRelativeNext(rawNext) ? rawNext : talentDashboardRoutes.home();
}

export function nextFromCallbackRedirectUrl(redirectUrl: string | undefined): string | null {
	if (!redirectUrl) return null;
	try {
		return new URL(redirectUrl, RELATIVE_BASE).searchParams.get("next");
	} catch {
		return null;
	}
}

export function readAuthNextCookie(): string | null {
	if (typeof document === "undefined") return null;
	const entry = document.cookie
		.split("; ")
		.find((candidate) => candidate.startsWith(`${AUTH_NEXT_COOKIE}=`))
		?.slice(AUTH_NEXT_COOKIE.length + 1);
	if (!entry) return null;
	try {
		return decodeURIComponent(entry);
	} catch {
		return null;
	}
}

export function companyOnboardingNext(): string {
	const continuation = readAuthNextCookie();
	return marketingRoutes.onboardingUrl({
		next: continuation && isOauthContinuationNext(continuation) ? continuation : undefined,
	});
}
