"use client";

import { marketingRoutes } from "@clera/route-factory";
import { CleraCircle } from "@v2/components/ui/clera-circle";
import { Separator } from "@v2/components/ui/separator";
import { COMPANIES_COUNT_LABEL } from "@v2/lib/counts";
import Link from "next/link";
import { AuthOptions } from "./auth-options";
import { EmailStep } from "./email-step";
import { HiringHintPointer } from "./hiring-hint-pointer";
import { IntentConfirmStep } from "./intent-confirm-step";
import { OtpStep } from "./otp-step";
import type { AuthCardProps, HiringHint } from "./types";
import { useAuthFlow } from "./use-auth-flow";

const DEFAULT_HIRING_HINT: HiringHint = { prompt: "Looking to hire?", label: "Start here", href: marketingRoutes.hire };

function AuthCard({
	onSuccess,
	defaultEmail,
	heading,
	subtitle,
	redirectUrl,
	showFooter = false,
	onCreateUser,
	authSwitch,
	authSwitchHref,
	requireBusinessEmail,
	hiringHint = DEFAULT_HIRING_HINT,
}: AuthCardProps) {
	const flow = useAuthFlow({ defaultEmail, onSuccess, redirectUrl, onCreateUser, requireBusinessEmail });
	const showHiringHint = !requireBusinessEmail && (flow.step === "options" || flow.step === "email");

	return (
		<div className="flex flex-col items-center gap-6">
			<CleraCircle variant="light" size="size-[2.9375rem]" iconSize="size-5" />

			{heading && (
				<div className="text-center">
					<h2 className="font-v2-heading text-4xl font-medium leading-none text-v2-brand-teal tracking-tighter">
						{heading}
					</h2>
					{subtitle && (
						<p className="mt-3 font-v2-body text-base font-light leading-snug text-v2-text-secondary">{subtitle}</p>
					)}
				</div>
			)}

			<div className="flex w-full flex-col items-center gap-2">
				{flow.step === "options" && (
					<AuthOptions
						onGoogleClick={flow.handleGoogleAuth}
						onLinkedInClick={flow.handleLinkedInAuth}
						onEmailClick={flow.goToEmail}
						isLoading={flow.isLoading}
						error={flow.error}
						authSwitch={authSwitch}
						authSwitchHref={authSwitchHref}
					/>
				)}

				{flow.step === "confirm-intent" && (
					<IntentConfirmStep
						onContinueAsCompany={flow.confirmCompanyIntent}
						onContinueAsTalent={flow.confirmTalentIntent}
						onBack={flow.goBack}
						isLoading={flow.isLoading}
						error={flow.error}
					/>
				)}

				{flow.step === "email" && (
					<EmailStep
						email={flow.email}
						onEmailChange={flow.setEmail}
						onSubmit={flow.handleEmailSubmit}
						onBack={flow.goBack}
						isLoading={flow.isLoading}
						error={flow.error}
					/>
				)}

				{flow.step === "otp" && (
					<OtpStep
						maskedEmail={flow.maskedEmail}
						otpValue={flow.otpValue}
						onOtpChange={flow.handleOtpChange}
						onResend={flow.handleResend}
						onBack={flow.goBack}
						isVerifying={flow.isVerifying}
						resendCooldown={flow.resendCooldown}
						error={flow.error}
						hasResent={flow.hasResent}
					/>
				)}

				{showHiringHint && (
					<p className="text-center font-v2-body text-sm font-light text-v2-text-muted">
						{hiringHint.prompt}{" "}
						<span className="relative inline-block">
							<Link
								href={hiringHint.href}
								className="font-normal text-v2-text-primary underline-offset-2 transition-colors hover:text-v2-text-primary hover:underline"
								data-ph-capture-attribute-action="cta-click"
								data-ph-capture-attribute-section="auth-card-hiring-hint"
								data-ph-capture-attribute-label="hiring-hint"
							>
								{hiringHint.label}
							</Link>
							{hiringHint.pointerLabel && <HiringHintPointer label={hiringHint.pointerLabel} />}
						</span>
					</p>
				)}
			</div>

			{showFooter && (
				<>
					<Separator className="my-4 bg-v2-border-default" />
					<div className="flex flex-col items-center gap-2 text-center">
						<p className="font-v2-body text-sm text-v2-text-muted">Trusted by {COMPANIES_COUNT_LABEL} companies</p>
						<p className="font-v2-body text-sm text-v2-text-muted">
							By signing up, you agree to our{" "}
							<a href={marketingRoutes.terms} className="underline">
								Terms
							</a>{" "}
							and{" "}
							<a href={marketingRoutes.privacy} className="underline">
								Privacy Policy
							</a>
						</p>
					</div>
				</>
			)}
		</div>
	);
}
AuthCard.displayName = "AuthCard";

export { AuthCard };
