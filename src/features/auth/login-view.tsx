"use client";

import { marketingRoutes } from "@clera/route-factory";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "./auth-card";
import { AuthCardTerms, AuthPageLayout } from "./auth-page-layout";
import { isOauthContinuationNext } from "./next-target";
import { resolveLoginCallbackNext } from "./resolve-next";
import { useAuthError } from "./use-auth-error";
import { useAuthRedirect } from "./use-auth-redirect";

function LoginView() {
	const errorMessage = useAuthError();
	const searchParams = useSearchParams();
	const callbackNext = resolveLoginCallbackNext(searchParams);
	const { oauthRedirectUrl, handleSuccess } = useAuthRedirect({ callbackNext });
	const defaultEmail = searchParams.get("email") ?? undefined;
	const isConnectingClient = isOauthContinuationNext(callbackNext);

	return (
		<AuthPageLayout cardFooter={<AuthCardTerms />} errorMessage={errorMessage}>
			<AuthCard
				onSuccess={handleSuccess}
				heading={isConnectingClient ? "Connect Clera" : "Welcome back"}
				subtitle={
					isConnectingClient ? "Looking for your next role? Sign in or sign up below." : "Sign in to your account"
				}
				hiringHint={
					isConnectingClient
						? {
								prompt: "Hiring?",
								label: "Set up your company",
								pointerLabel: "New company? Start here",
								href: marketingRoutes.onboardingUrl({ next: callbackNext }),
							}
						: undefined
				}
				redirectUrl={oauthRedirectUrl}
				authSwitch={isConnectingClient ? undefined : "signup"}
				defaultEmail={defaultEmail}
			/>
		</AuthPageLayout>
	);
}
LoginView.displayName = "LoginView";

export { LoginView };
