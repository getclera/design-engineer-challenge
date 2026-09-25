import { extractFitReasonHook } from "@clera/shared-utils";

interface ReviewFitReasonProps {
	reason: string | null;
}

/** The strongest line of the fit reason, tinted so it's read right after the facts. */
export function ReviewFitReason({ reason }: ReviewFitReasonProps) {
	const hook = extractFitReasonHook(reason);
	if (!hook) return null;

	return (
		<div className="border-t border-v2-border-warm/50 bg-v2-brand-green/8 px-4 py-2.5 sm:px-5">
			<p className="font-v2-body font-medium text-2xs text-v2-text-brand-green uppercase tracking-wider">
				Why it's a match
			</p>
			<p className="mt-1 text-pretty font-v2-body font-medium text-sm text-v2-text-primary leading-snug">{hook}</p>
		</div>
	);
}

ReviewFitReason.displayName = "ReviewFitReason";
