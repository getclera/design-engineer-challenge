"use client";

import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
	access_denied: "Sign-in was cancelled. Please try again.",
	server_error: "Something went wrong during sign-in. Please try again.",
	temporarily_unavailable: "The sign-in service is temporarily unavailable. Please try again in a moment.",
	invalid_request: "Something went wrong with the sign-in request. Please try again.",
	unauthorized_client: "Something went wrong with the sign-in request. Please try again.",
	unsupported_response_type: "Something went wrong with the sign-in request. Please try again.",
	invalid_scope: "Something went wrong with the sign-in request. Please try again.",
	user_cancelled_login: "Sign-in was cancelled. Please try again.",
	user_cancelled_authorize: "Sign-in was cancelled. Please try again.",
	missing_code: "Something went wrong with the login link. Please try again.",
	code_already_used: "This login link has already been used. Please request a new one.",
	exchange_failed: "We couldn't complete your login. Please try again.",
	no_session: "Login failed - no session was created. Please try again.",
	unexpected: "An unexpected error occurred. Please try again.",
};

function useAuthError(): string | null {
	const searchParams = useSearchParams();
	const errorCode = searchParams.get("error");
	const errorDescription = searchParams.get("error_description");
	return (errorCode ? ERROR_MESSAGES[errorCode] : null) || errorDescription || null;
}

export { useAuthError };
