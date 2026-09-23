import { clerkFrontendApiOrigin } from "@clera/auth/frontend-api";
import { authRoutes, chatRoutes, marketingRoutes, orgRoutes, talentDashboardRoutes } from "@clera/route-factory";

export const TALENT_FIRST_LANDING_PATH = talentDashboardRoutes.home();

export const BUSINESS_EMAIL_GATED_PROVIDERS = new Set(["google"]);

export function isClerkOauthAuthorizeNext(next: string): boolean {
	try {
		const parsed = new URL(next);
		return parsed.origin === clerkFrontendApiOrigin() && parsed.pathname === "/oauth/authorize";
	} catch {
		return false;
	}
}

export function isOauthContinuationNext(next: string): boolean {
	return isClerkOauthAuthorizeNext(next) || next.startsWith(authRoutes.oauthConsent());
}

const OAUTH_CONSENT_HOSTS = new Set(["getclera.com", "www.getclera.com", "localhost:3000"]);

export function oauthConsentNextFromRedirectUrl(next: string): string | null {
	try {
		const parsed = new URL(next);
		if (!OAUTH_CONSENT_HOSTS.has(parsed.host)) return null;
		if (parsed.pathname !== authRoutes.oauthConsent()) return null;
		return `${parsed.pathname}${parsed.search}`;
	} catch {
		return null;
	}
}

export function isOnboardingNext(next: string): boolean {
	return next === "/onboarding" || next.startsWith("/onboarding?") || next.startsWith("/onboarding/");
}

export function isOrgOnboardingNext(next: string): boolean {
	return next === orgRoutes.onboarding || next.startsWith(`${orgRoutes.onboarding}?`);
}

export function isClaimNext(next: string): boolean {
	try {
		const params = new URLSearchParams(next.split("?")[1] ?? "");
		return params.has("claim");
	} catch {
		return false;
	}
}

export function signupCompanyId(next: string): string | null {
	try {
		const params = new URLSearchParams(next.split("?")[1] ?? "");
		return params.get("signup-company");
	} catch {
		return null;
	}
}

export function signupIntentForNext(next: string): "company" | undefined {
	return signupCompanyId(next) !== null || isOnboardingNext(next) ? "company" : undefined;
}

export function isTalentChatNext(next: string): boolean {
	return next === chatRoutes.home || next.startsWith(`${chatRoutes.home}?`) || next.startsWith(`${chatRoutes.home}/`);
}

export function requiresBusinessEmailGate(next: string): boolean {
	return isOnboardingNext(next) || isOrgOnboardingNext(next) || isClaimNext(next);
}

export function businessEmailRejectPath(next: string): string {
	const rejectPath = isClaimNext(next)
		? (next.split("?")[0] ?? authRoutes.login())
		: isOrgOnboardingNext(next)
			? orgRoutes.onboarding
			: marketingRoutes.onboarding;
	return `${rejectPath}?error=business_email_required`;
}
