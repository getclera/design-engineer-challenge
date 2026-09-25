"use client";

import { Button } from "@v2/components/ui/button";
import { cn } from "@v2/lib/utils";
import type { ReviewDecision, ReviewTally } from "./hooks/use-review-board";

interface ReviewRecapProps {
	roleName: string | null;
	tally: ReviewTally;
	decisions: ReviewDecision[];
	onReviewMaybes: () => void;
}

const duration = (seconds: number) => (seconds < 60 ? `${Math.round(seconds)}s` : `${Math.round(seconds / 60)} min`);

function namesLine(names: string[]) {
	if (names.length <= 3) return names.join(names.length === 2 ? " and " : ", ");
	return `${names.slice(0, 3).join(", ")} and ${names.length - 3} more`;
}

/** What this visit added up to, shown once the queue is empty. */
export function ReviewRecap({ roleName, tally, decisions, onReviewMaybes }: ReviewRecapProps) {
	const intros = decisions.filter((d) => d.kind === "intro").map((d) => d.name);
	const stats = [
		{ label: "intros requested", value: tally.intro, className: "text-v2-brand-green" },
		{ label: "to revisit", value: tally.maybe, className: "text-v2-status-warning" },
		{ label: "passed", value: tally.pass, className: "text-v2-text-primary" },
	];

	return (
		<div className="flex flex-col items-center">
			<h3 className="text-balance font-v2-heading text-v2-text-primary text-xl">
				All caught up{roleName ? ` for ${roleName}` : ""}
			</h3>
			<p className="mt-2 font-v2-body text-sm text-v2-text-secondary tabular-nums">
				{tally.total} {tally.total === 1 ? "person" : "people"} in {duration(tally.seconds)}
				{tally.avgSeconds !== null && `, ~${tally.avgSeconds}s each`}.
			</p>
			<div className="mt-6 grid w-full max-w-md grid-cols-3 gap-2">
				{stats.map((s) => (
					<div key={s.label} className="rounded-v2-md border border-v2-border-divider px-3 py-3">
						<p className={cn("font-v2-heading text-2xl tabular-nums leading-none", s.className)}>{s.value}</p>
						<p className="mt-1.5 font-v2-body text-v2-text-tertiary text-xs">{s.label}</p>
					</div>
				))}
			</div>
			{intros.length > 0 && (
				<p className="mt-4 max-w-md font-v2-body text-sm text-v2-text-secondary">
					We're reaching out to {namesLine(intros)}.
				</p>
			)}
			{tally.maybe > 0 && (
				<Button variant="ghost" size="sm" className="mt-5" onClick={onReviewMaybes}>
					Review {tally.maybe} {tally.maybe === 1 ? "maybe" : "maybes"}
				</Button>
			)}
		</div>
	);
}

ReviewRecap.displayName = "ReviewRecap";
