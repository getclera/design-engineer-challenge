"use client";

import { BackButton } from "@v2/components/navigation";
import { Button } from "@v2/components/ui/button";

interface IntentConfirmStepProps {
	onContinueAsCompany: () => void;
	onContinueAsTalent: () => void;
	onBack?: () => void;
	isLoading?: boolean;
	error?: string | null;
}

function IntentConfirmStep({
	onContinueAsCompany,
	onContinueAsTalent,
	onBack,
	isLoading = false,
	error = null,
}: IntentConfirmStepProps) {
	return (
		<div className="flex w-full flex-col items-center gap-5">
			<div className="text-center">
				<h3 className="font-v2-heading text-xl font-medium text-v2-text-primary">Are you looking to hire?</h3>
				<p className="mt-2 font-v2-body text-sm font-light text-v2-text-secondary">
					It looks like you're signing up with a company email.
				</p>
			</div>

			<div className="flex w-full flex-col gap-3">
				<Button variant="primary" size="lg" className="w-full" onClick={onContinueAsCompany} disabled={isLoading}>
					Yes, I'm hiring
				</Button>
				<Button variant="ghost" size="lg" className="w-full" onClick={onContinueAsTalent} disabled={isLoading}>
					No, I'm looking for a job
				</Button>
			</div>

			{isLoading && <p className="text-center text-sm text-v2-text-muted">Sending code...</p>}
			{error && <p className="text-center text-sm text-v2-status-error">{error}</p>}

			{onBack && (
				<div className="flex w-full justify-center">
					<BackButton onClick={onBack} />
				</div>
			)}
		</div>
	);
}
IntentConfirmStep.displayName = "IntentConfirmStep";

export { IntentConfirmStep };
