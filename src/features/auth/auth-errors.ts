const DEFAULT_SEND_COPY = "Failed to send verification code. Please try again.";
const DEFAULT_VERIFY_COPY = "Invalid code. Please try again.";

function matches(error: { code?: string; message?: string }, codes: string[], fragments: string[]): boolean {
	const code = error.code?.toLowerCase();
	const message = error.message?.toLowerCase() ?? "";
	if (code && codes.includes(code)) return true;
	return fragments.some((fragment) => message.includes(fragment));
}

export function mapSendOtpError(error: { code?: string; message?: string } | null | undefined): string {
	if (!error) return DEFAULT_SEND_COPY;

	if (
		matches(
			error,
			["over_email_send_rate_limit", "over_request_rate_limit", "too_many_requests"],
			["rate limit", "too many requests"],
		)
	) {
		return "Too many requests. Please wait a minute before trying again.";
	}
	if (
		matches(
			error,
			["signup_disabled", "otp_disabled", "email_provider_disabled"],
			["signup is disabled", "otp is disabled"],
		)
	) {
		return "Sign-ups are temporarily paused. Please try again later.";
	}
	if (matches(error, ["validation_failed", "form_param_format_invalid"], ["unable to validate", "invalid email"])) {
		return "That email doesn't look valid. Please double-check it.";
	}
	if (matches(error, ["form_identifier_not_found"], [])) {
		return "We don't recognize that email. Please double-check it.";
	}

	return DEFAULT_SEND_COPY;
}

export function mapVerifyOtpError(error: { code?: string; message?: string } | null | undefined): string {
	if (!error) return DEFAULT_VERIFY_COPY;

	if (
		matches(
			error,
			["otp_expired", "expired_token", "verification_expired", "verification_failed"],
			["expired", "has expired"],
		)
	) {
		return "That code has expired. Tap Resend below to get a new one.";
	}
	if (matches(error, ["over_request_rate_limit", "too_many_requests"], ["rate limit", "too many"])) {
		return "Too many attempts. Please wait a moment and try again.";
	}
	if (matches(error, ["user_not_found"], ["user not found"])) {
		return "We don't recognize that email. Tap Back and double-check it.";
	}

	return DEFAULT_VERIFY_COPY;
}
