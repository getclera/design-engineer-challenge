"use client";

import { Button } from "@v2/components/ui/button";
import { Input } from "@v2/components/ui/input";
import { useCallback, useMemo } from "react";
import { isValidEmail } from "@/utils/validation";
import { CaptchaSlot } from "./captcha-slot";
import { suggestPersonalEmailCorrection } from "./email-typo-suggest";

interface EmailStepProps {
	email: string;
	onEmailChange: (value: string) => void;
	onSubmit: () => void;
	onBack: () => void;
	isLoading: boolean;
	error: string | null;
}

function EmailStep({ email, onEmailChange, onSubmit, onBack, isLoading, error }: EmailStepProps) {
	const isValid = isValidEmail(email.trim());
	const typoSuggestion = useMemo(() => suggestPersonalEmailCorrection(email), [email]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && isValid && !isLoading) {
				onSubmit();
			}
		},
		[isValid, isLoading, onSubmit],
	);

	const applyTypoSuggestion = useCallback(() => {
		if (typoSuggestion) onEmailChange(typoSuggestion);
	}, [typoSuggestion, onEmailChange]);

	return (
		<div className="flex w-full flex-col items-center gap-5">
			<div className="text-center">
				<h3 className="font-v2-heading text-xl font-medium text-v2-text-primary tracking-tight">Enter your email</h3>
				<p className="mt-1 font-v2-body text-sm font-light text-v2-text-secondary">
					We&rsquo;ll send you a code to verify
				</p>
			</div>

			<Input
				type="email"
				placeholder="you@example.com"
				value={email}
				onChange={(e) => onEmailChange(e.target.value)}
				onKeyDown={handleKeyDown}
				disabled={isLoading}
				autoFocus
				autoComplete="email"
				aria-label="Email address"
				className="h-13.25 px-5"
			/>

			{typoSuggestion && !error && (
				<p className="animate-in fade-in slide-in-from-top-1 duration-200 text-center font-v2-body text-sm text-v2-text-secondary">
					Did you mean{" "}
					<Button
						type="button"
						variant="unstyled"
						size="unstyled"
						onClick={applyTypoSuggestion}
						className="font-medium text-v2-brand-teal underline-offset-2 hover:underline"
					>
						{typoSuggestion}
					</Button>
					?
				</p>
			)}

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
				variant="primary"
				size="lg"
				className="w-full"
				onClick={onSubmit}
				disabled={!isValid || isLoading}
			>
				{isLoading ? "Sending..." : "Continue"}
			</Button>

			<Button
				type="button"
				variant="unstyled"
				size="unstyled"
				onClick={onBack}
				disabled={isLoading}
				className="font-v2-body text-sm font-light text-v2-text-secondary transition-colors hover:text-v2-text-primary"
			>
				&lsaquo; Back
			</Button>
		</div>
	);
}
EmailStep.displayName = "EmailStep";

export { EmailStep };
