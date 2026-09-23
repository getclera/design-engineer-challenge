"use client";

import { marketingRoutes } from "@clera/route-factory";
import { Button } from "@v2/components/ui/button";
import { ErrorBanner } from "@v2/components/ui/error-banner";
import { PricingTermsCard } from "./pricing-terms-card";

interface TermsAcceptanceBlockProps {
	onAccept: () => void;
	isPending: boolean;
	ctaLabel: string;
	pendingLabel?: string;
	failed?: boolean;
}

function TermsAcceptanceBlock({ onAccept, isPending, ctaLabel, pendingLabel, failed }: TermsAcceptanceBlockProps) {
	return (
		<div className="flex w-full flex-col gap-4">
			{failed && (
				<ErrorBanner action={{ label: "Try again", onClick: onAccept, disabled: isPending }}>
					We couldn&rsquo;t record that. Please try again.
				</ErrorBanner>
			)}

			<PricingTermsCard />

			<Button type="button" variant="primary" size="lg" className="w-full" onClick={onAccept} disabled={isPending}>
				{isPending ? (pendingLabel ?? "Saving...") : ctaLabel}
			</Button>

			<p className="text-center font-v2-body text-[11px] leading-relaxed text-v2-text-muted">
				By continuing you agree to Clera&rsquo;s{" "}
				<a
					href={marketingRoutes.terms}
					target="_blank"
					rel="noopener noreferrer"
					className="underline transition-colors hover:text-v2-text-secondary"
				>
					Terms of Service
				</a>
				.
			</p>
		</div>
	);
}
TermsAcceptanceBlock.displayName = "TermsAcceptanceBlock";

export { TermsAcceptanceBlock, type TermsAcceptanceBlockProps };
