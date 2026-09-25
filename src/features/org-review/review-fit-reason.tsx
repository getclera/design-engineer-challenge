import { extractFitReasonHook } from "@clera/shared-utils";

interface ReviewFitReasonProps {
	reason: string | null;
}

/** The strongest line of the fit reason, highlighted at the top of the card so it's read first. */
export function ReviewFitReason({ reason }: ReviewFitReasonProps) {
	const hook = extractFitReasonHook(reason);
	if (!hook) {
		return (
			<p className="rounded-v2-md border border-v2-border-default border-dashed px-4 py-2 font-v2-body text-v2-text-tertiary text-xs">
				No reason given for this pick. Skim the profile.
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-1 rounded-v2-md border border-v2-brand-green/30 bg-v2-brand-green/8 px-4 py-2.5 sm:flex-row sm:items-baseline sm:gap-3">
			<p className="shrink-0 font-v2-body font-medium text-2xs text-v2-text-brand-green uppercase tracking-wider">
				Why it's a match
			</p>
			<p className="text-pretty font-v2-body font-medium text-sm text-v2-text-primary leading-snug">{hook}</p>
		</div>
	);
}

ReviewFitReason.displayName = "ReviewFitReason";
