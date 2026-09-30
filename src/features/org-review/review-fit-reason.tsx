import { extractFitReasonHook } from "@clera/shared-utils";
import { CleraIcon } from "@v2/components/ui/clera-icon";

interface ReviewFitReasonProps {
	reason: string | null;
}

/** The strongest line of the fit reason: the card's headline, read before the name. */
export function ReviewFitReason({ reason }: ReviewFitReasonProps) {
	const hook = extractFitReasonHook(reason);

	return (
		<div className="border-b border-v2-border-warm/50 bg-v2-brand-green/8 px-4 pt-3 pb-2.5 sm:px-5">
			{/* The Clera mark: this line is our recommendation, not the candidate's profile. */}
			<p className="flex items-center gap-1.5 font-v2-body font-medium text-2xs text-v2-text-brand-green uppercase tracking-wider">
				<CleraIcon className="size-3" />
				Why it's a match
			</p>
			{hook ? (
				<p className="mt-1 text-pretty font-medium font-v2-heading text-base text-v2-text-primary sm:text-lg leading-snug">{hook}</p>
			) : (
				// No note from us: say so rather than invent one from the candidate's own headline.
				<p className="mt-1 text-pretty font-v2-body text-sm text-v2-text-tertiary leading-snug">
					No note from us on this one. Open the profile to see why.
				</p>
			)}
		</div>
	);
}

ReviewFitReason.displayName = "ReviewFitReason";
