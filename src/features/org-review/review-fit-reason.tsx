import { extractFitReasonDetails, extractFitReasonHook } from "@clera/shared-utils";
import { CleraIcon } from "@v2/components/ui/clera-icon";

interface ReviewFitReasonProps {
	reason: string | null;
}

/** The strongest line of the fit reason: the card's headline, read before the name. */
export function ReviewFitReason({ reason }: ReviewFitReasonProps) {
	const hook = extractFitReasonHook(reason);
	const details = hook ? extractFitReasonDetails(reason) : [];

	return (
		<div className="border-b border-v2-border-warm/50 bg-v2-brand-green/8 px-4 pt-3 pb-2.5 sm:px-5">
			{/* The Clera mark: this line is our recommendation, not the candidate's profile. */}
			<p className="flex items-center gap-1.5 font-v2-body font-medium text-2xs text-v2-text-brand-green uppercase tracking-wider">
				<CleraIcon className="size-3" />
				Why it's a match
			</p>
			{hook ? (
				<>
					<p className="mt-1 text-pretty font-medium font-v2-heading text-base text-v2-text-primary sm:text-lg leading-snug">{hook}</p>
					{details.length > 0 && (
						<ul className="mt-1.5 flex flex-col gap-0.5 font-v2-body text-sm text-v2-text-secondary leading-snug">
							{details.map((line) => (
								<li key={line} className="flex gap-1.5 text-pretty">
									<span aria-hidden className="text-v2-text-brand-green">•</span>
									{line}
								</li>
							))}
						</ul>
					)}
				</>
			) : (
				// No note from us: say so rather than invent one from the candidate's own headline.
				<p className="mt-1 text-pretty font-v2-body text-sm text-v2-text-tertiary leading-snug">
					No note from us on this one.
				</p>
			)}
		</div>
	);
}

ReviewFitReason.displayName = "ReviewFitReason";
