"use client";

import { Button } from "@v2/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@v2/components/ui/input-otp";
import { cn } from "@v2/lib/utils";
import { useMemo } from "react";
import { CaptchaSlot } from "./captcha-slot";
import type { OtpStepProps } from "./types";

function OtpStep({
	maskedEmail,
	otpValue,
	onOtpChange,
	onResend,
	onBack,
	isVerifying,
	resendCooldown,
	error,
	showHeader = true,
	hasResent = false,
}: OtpStepProps) {
	const resendLabel = useMemo(() => (resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend"), [resendCooldown]);
	const isResendDisabled = resendCooldown > 0 || isVerifying;

	return (
		<div className="flex flex-col items-center gap-5">
			{showHeader && (
				<div className="text-center">
					<h3 className="font-v2-heading text-xl font-medium text-v2-text-primary tracking-tight">Check your email</h3>
					<p className="mt-1 font-v2-body text-sm font-light text-v2-text-secondary">
						We sent a code to{" "}
						<code className="rounded bg-v2-bg-input-solid px-2 py-0.5 font-mono text-sm text-v2-text-primary">
							{maskedEmail}
						</code>
					</p>
					{hasResent && (
						<p className="mt-2 font-v2-body text-xs font-light text-v2-text-muted">
							Your previous code is no longer valid - use the newest one.
						</p>
					)}
				</div>
			)}

			<div className="flex flex-col items-center gap-4 py-2">
				<InputOTP
					maxLength={6}
					value={otpValue}
					onChange={onOtpChange}
					disabled={isVerifying}
					autoComplete="one-time-code"
					aria-label="Verification code"
				>
					<InputOTPGroup>
						<InputOTPSlot index={0} />
						<InputOTPSlot index={1} />
						<InputOTPSlot index={2} />
						<InputOTPSlot index={3} />
						<InputOTPSlot index={4} />
						<InputOTPSlot index={5} />
					</InputOTPGroup>
				</InputOTP>

				{error && (
					<p
						role="alert"
						className="animate-in fade-in slide-in-from-top-1 duration-200 text-center text-sm text-v2-status-error"
					>
						{error}
					</p>
				)}

				<CaptchaSlot />

				<Button
					type="button"
					variant="unstyled"
					size="unstyled"
					onClick={onResend}
					disabled={isResendDisabled}
					className={cn(
						"font-v2-body text-sm font-light transition-colors",
						isResendDisabled ? "text-v2-text-muted" : "text-v2-text-secondary hover:text-v2-text-primary",
					)}
				>
					Didn&rsquo;t get it? <span className={cn(!isResendDisabled && "underline")}>{resendLabel}</span>
				</Button>
			</div>

			{onBack && (
				<Button
					type="button"
					variant="unstyled"
					size="unstyled"
					onClick={onBack}
					disabled={isVerifying}
					className="font-v2-body text-sm font-light text-v2-text-secondary transition-colors hover:text-v2-text-primary"
				>
					&lsaquo; Back
				</Button>
			)}
		</div>
	);
}
OtpStep.displayName = "OtpStep";

export { OtpStep };
