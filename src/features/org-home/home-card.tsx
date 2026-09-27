import { Card } from "@v2/components/ui/card";
import type { ReactNode } from "react";

/** A Home section: the app's Card with Review's list header (serif title, small note on the right). */
export function HomeCard({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
	return (
		<Card className="min-w-0">
			<section aria-label={title}>
				<header className="flex items-baseline justify-between gap-3 border-v2-border-divider border-b px-4 py-3 max-lg:px-3">
					<h2 className="font-v2-heading text-lg text-v2-text-primary">{title}</h2>
					{note && <p className="font-v2-body text-v2-text-tertiary text-xs tabular-nums">{note}</p>}
				</header>
				{children}
			</section>
		</Card>
	);
}
