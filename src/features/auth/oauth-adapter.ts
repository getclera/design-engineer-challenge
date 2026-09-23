import type { ClerkOauthProvider } from "@clera/auth";
import { startOAuthRedirect as startClerkOAuthRedirect } from "@clera/auth/client";
import { authRoutes } from "@clera/route-factory";
export async function startOAuthRedirect(params: { provider: ClerkOauthProvider; next: string }): Promise<void> {
	return startClerkOAuthRedirect({
		provider: params.provider,
		callbackUrl: authRoutes.ssoCallback(params.next),
		completeUrl: authRoutes.signinComplete(params.next, { provider: params.provider }),
		sessionResumeUrl: authRoutes.signinComplete(params.next),
	});
}
