import type { EmailCodeResult, SignupIntent } from "@clera/auth/client";
import { firePostSignin } from "./post-signin-client";

interface SendOptions {
	signupIntent?: SignupIntent;
}

export async function sendEmailCode(email: string, { signupIntent }: SendOptions = {}): Promise<EmailCodeResult> {
	const engine = await import("@clera/auth/client");
	return engine.sendEmailCode(email, { allowSignUp: true, signupIntent });
}

export async function verifyEmailCode(
	email: string,
	code: string,
	onPostSigninSuccess?: () => void,
): Promise<EmailCodeResult> {
	const engine = await import("@clera/auth/client");
	return engine.verifyEmailCode(email, code, {
		onVerified: () => firePostSignin({ flow: "email_code" }, onPostSigninSuccess),
	});
}
