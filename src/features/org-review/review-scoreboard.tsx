"use client";

import { cn } from "@v2/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReviewTally } from "./hooks/use-review-board";

interface ReviewScoreboardProps {
	left: number;
	/** The server holds more behind this batch: "13+ left". */
	truncated: boolean;
	tally: ReviewTally;
}

const TYPICAL_SECONDS = 20;
const SEGMENTS = [
	{ kind: "intro", label: "intro", color: "bg-v2-brand-green" },
	{ kind: "maybe", label: "maybe", color: "bg-v2-status-warning" },
	// Same red as every other pass (list ×, swipe stamp): gray blended into the empty track.
	{ kind: "pass", label: "pass", color: "bg-v2-status-error" },
] as const;

const timeLeft = (seconds: number) => (seconds < 60 ? "under a minute" : `~${Math.ceil(seconds / 60)} min`);

/** Progress for this visit: split by decision, with pace and a few small milestones. */
export function ReviewScoreboard({ left, truncated, tally }: ReviewScoreboardProps) {
	const done = tally.total;
	const total = left + done;
	const milestone = useMilestone(left, done, total);
	const pace =
		tally.avgSeconds === null
			? `${timeLeft(left * TYPICAL_SECONDS)} at about ${TYPICAL_SECONDS}s each`
			: `~${tally.avgSeconds}s each · ${left > 0 ? `${timeLeft(left * tally.avgSeconds)} to go` : "done"}`;

	return (
		<div className="flex flex-col gap-1.5 font-v2-body text-v2-text-tertiary text-xs tabular-nums">
			<div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
				<span>
					<b className="font-semibold text-sm text-v2-text-primary">
						{left}
						{truncated && "+"}
					</b>{" "}
					left
				</span>
				<span role="status" className="pointer-events-none">
					<AnimatePresence>
						{milestone && (
							<motion.span
								key={milestone}
								initial={{ opacity: 0, y: 4 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0 }}
								className="inline-block rounded-full bg-v2-text-primary px-2 py-0.5 font-medium leading-4 text-v2-bg-card text-xs"
							>
								{milestone}
							</motion.span>
						)}
					</AnimatePresence>
				</span>
				<span className="ml-auto flex gap-3">
					{SEGMENTS.map((s) => (
						<span key={s.kind} className="flex items-center gap-1.5">
							<i className={cn("size-2 rounded-xs", s.color)} />
							<b className="font-semibold text-v2-text-primary">{tally[s.kind]}</b> {s.label}
						</span>
					))}
				</span>
			</div>
			<div
				role="progressbar"
				aria-label="Review progress"
				aria-valuenow={done}
				aria-valuemin={0}
				aria-valuemax={total}
				className="flex h-2 gap-0.5"
			>
				{SEGMENTS.map(
					(s) =>
						tally[s.kind] > 0 && (
							<div
								key={s.kind}
								className={cn("h-full rounded-[3px] transition-[width] duration-300", s.color)}
								style={{ width: `${(tally[s.kind] / total) * 100}%` }}
							/>
						),
				)}
				<div className="h-full flex-1 rounded-[3px] bg-v2-border-divider" />
			</div>
			{/* Phone: "left" and the dots are enough; the pace line gives its height to the card. */}
			<div className="flex flex-wrap justify-between gap-x-4 max-lg:hidden">
				<span>{pace}</span>
				<span>
					{done} of {total}
					{truncated && "+"} done
				</span>
			</div>
		</div>
	);
}

ReviewScoreboard.displayName = "ReviewScoreboard";

/** "First one down", "Halfway there", "3 to go": each once per filter, shown for a moment. */
function useMilestone(left: number, done: number, total: number) {
	const [message, setMessage] = useState<string | null>(null);
	const shown = useRef(new Set<string>());
	useEffect(() => {
		// A new filter starts from zero: the milestones can play again.
		if (done === 0) {
			shown.current.clear();
			return;
		}
		const next =
			done === 1 ? "First one down" : left === 3 ? "3 to go" : done >= Math.ceil(total / 2) ? "Halfway there" : null;
		if (!next || shown.current.has(next)) return;
		shown.current.add(next);
		setMessage(next);
	}, [left, done, total]);
	useEffect(() => {
		if (!message) return;
		const timer = setTimeout(() => setMessage(null), 1600);
		return () => clearTimeout(timer);
	}, [message]);
	return message;
}
