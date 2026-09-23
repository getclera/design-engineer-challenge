import type { AccountCompletenessResponse } from "@app/api/account/check-completeness/route";
import type { AuthMeResponse } from "@app/api/auth/me/route";
import type { SignOutResponse } from "@app/api/auth/signout/route";
import { type ApiResult, callApi, fetchApi } from "./client";

export type { AuthMeResponse };

export type SignInResponse =
	| { success: false; error: string; emailSent: false }
	| { success: true; emailSent: true; message: string; error?: never };

type SignInResult =
	| { ok: true; data: SignInResponse; error?: never }
	| Extract<ApiResult<SignInResponse>, { ok: false }>;

function me(): Promise<ApiResult<AuthMeResponse>> {
	return fetchApi<AuthMeResponse>("/api/auth/me");
}

async function signInWithOtp(email: string): Promise<SignInResult> {
	const { sendEmailCode } = await import("@v2/features/auth/email-code");
	const result = await sendEmailCode(email);
	if (result.error) {
		return { ok: true, data: { success: false, error: String(result.error), emailSent: false } };
	}
	return { ok: true, data: { success: true, emailSent: true, message: "Verification code sent to your email" } };
}

async function signOut(): Promise<ApiResult<SignOutResponse>> {
	const result = await callApi<SignOutResponse, Record<string, never>>("/api/auth/signout", {});
	try {
		const engine = await import("@clera/auth/client");
		await engine.signOutClerk();
	} catch {
		// Best-effort: cookie session is already cleared either way.
	}
	return result;
}

export interface ClerkPostSigninRequest {
	next?: string;
	oauthProvider?: "google" | "linkedin_oidc" | null;
	flow?: "oauth" | "email_code" | "ticket";
}

export interface ClerkPostSigninResponse {
	signOut: boolean;
	redirectTo: string | null;
}

function clerkPostSignin(body: ClerkPostSigninRequest): Promise<ApiResult<ClerkPostSigninResponse>> {
	return callApi<ClerkPostSigninResponse, ClerkPostSigninRequest>("/api/auth/post-signin", body);
}

function checkCompleteness(): Promise<ApiResult<AccountCompletenessResponse>> {
	return fetchApi<AccountCompletenessResponse>("/api/account/check-completeness");
}

export const auth = {
	me,
	signInWithOtp,
	signOut,
	checkCompleteness,
	clerkPostSignin,
};
