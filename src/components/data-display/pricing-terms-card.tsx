import { Check, CurrencyDollar, Percent } from "@phosphor-icons/react/ssr";
import { cn } from "@v2/lib/utils";
import type { ReactNode } from "react";
import { PLACEMENT_FEE_PERCENTAGE } from "@/config/constants";

interface PricingTermsCardProps {
	className?: string;
}

const ROWS: Array<{ icon: ReactNode; title: string; detail: string }> = [
	{
		icon: <Check className="size-3 text-v2-brand-teal" weight="bold" aria-hidden="true" />,
		title: "No upfront costs",
		detail: "search, match, and interview for free",
	},
	{
		icon: <Percent className="size-3 text-v2-brand-teal" weight="bold" aria-hidden="true" />,
		title: `${PLACEMENT_FEE_PERCENTAGE}% placement fee`,
		detail: "only when you make a successful hire",
	},
	{
		icon: <CurrencyDollar className="size-3 text-v2-brand-teal" weight="bold" aria-hidden="true" />,
		title: "De-risked payments",
		detail: "split across 30, 60, and 90 days after hire starts",
	},
];

function PricingTermsCard({ className }: PricingTermsCardProps) {
	return (
		<div className={cn("rounded-v2-md border border-v2-border-warm bg-v2-bg-input p-5 text-left", className)}>
			<h3 className="mb-3 font-v2-body text-sm font-semibold text-v2-text-primary">Simple, transparent pricing</h3>
			<ul className="space-y-2.5">
				{ROWS.map((row) => (
					<li key={row.title} className="flex items-start gap-2.5">
						<span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-v2-brand-teal/15">
							{row.icon}
						</span>
						<span className="font-v2-body text-sm text-v2-text-secondary">
							<span className="font-medium text-v2-text-primary">{row.title}</span> {row.detail}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
PricingTermsCard.displayName = "PricingTermsCard";

export { PricingTermsCard, type PricingTermsCardProps };
