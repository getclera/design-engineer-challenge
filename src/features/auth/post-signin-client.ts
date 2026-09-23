import { auth, type ClerkPostSigninRequest, type ClerkPostSigninResponse } from "@/services/api";
import { refreshClerkSessionToken } from "@/utils/identity-provider/session-token";
import logger from "@/utils/logger";

export async function callPostSignin(body: ClerkPostSigninRequest): Promise<ClerkPostSigninResponse | null> {
	const result = await auth.clerkPostSignin(body);
	if (!result.ok) {
		logger.error("[clerk post-signin] call failed", undefined, { status: result.error.status, flow: body.flow });
		return null;
	}
	try {
		await refreshClerkSessionToken();
	} catch (error) {
		logger.warn("[clerk post-signin] session token refresh failed after post-signin", { error });
	}
	return result.data;
}

declare global {
	interface Window {
		__clera_pendingPostSignin?: Promise<ClerkPostSigninResponse | null>;
	}
}

export function firePostSignin(body: ClerkPostSigninRequest, onSuccess?: () => void): void {
	const promise = callPostSignin(body);
	window.__clera_pendingPostSignin = promise;
	void promise
		.then((result) => {
			if (result) onSuccess?.();
		})
		.catch((error) => {
			logger.error("[clerk post-signin] fire-and-forget call threw", error);
		});
}

export function getPendingPostSignin(): Promise<ClerkPostSigninResponse | null> | null {
	return window.__clera_pendingPostSignin ?? null;
}
