import { extractFitReasonHook } from "@clera/shared-utils";

interface ReviewFitReasonProps {
	reason: string | null;
}

export function ReviewFitReason({ reason }: ReviewFitReasonProps) {
	const hook = extractFitReasonHook(reason);
	if (!hook) return null;

	return (
		<div className="border-t border-v2-border-warm/50 px-4 py-2 sm:px-5">
			<p className="font-v2-body text-2xs font-medium uppercase tracking-wider text-v2-text-muted">Why it's a match</p>
			<p className="mt-1 font-v2-body text-xs font-light leading-snug text-v2-text-secondary">{hook}</p>
		</div>
	);
}

ReviewFitReason.displayName = "ReviewFitReason";
