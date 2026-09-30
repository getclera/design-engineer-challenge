import { InfoTooltip } from "@v2/components/data-display";
import { Card } from "@v2/components/ui/card";
import { StatusPill } from "@v2/components/ui/status-pill";
import { type ReactNode, useId } from "react";

/** A Home section: the app's Card with Review's list header (serif title, small note on the right). */
export function HomeCard({
	title,
	hint,
	note,
	children,
}: {
	title: string;
	/** What the title means, in a tooltip next to it. */
	hint?: string;
	note?: ReactNode;
	children: ReactNode;
}) {
	const titleId = useId();
	return (
		<Card className="min-w-0">
			{/* Rows draw their own top line; the one right under the header would double its line. */}
			<section aria-labelledby={titleId} className="[&>header+*]:border-t-0">
				<header className="flex items-baseline justify-between gap-3 border-v2-border-divider border-b px-4 py-3 max-lg:px-3">
					<h2 className="flex items-center gap-1.5 font-v2-heading text-lg text-v2-text-primary">
						<span id={titleId}>{title}</span>
						{hint && <InfoTooltip>{hint}</InfoTooltip>}
					</h2>
					{note && <p className="font-v2-body text-v2-text-tertiary text-xs tabular-nums">{note}</p>}
				</header>
				{children}
			</section>
		</Card>
	);
}

/** Marks numbers made up for this case: there's no pipeline or drop schedule behind them. */
export function SampleTag() {
	return (
		<StatusPill tone="muted" size="xs" title="Made-up data for this case">
			Sample
		</StatusPill>
	);
}
