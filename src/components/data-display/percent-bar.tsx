"use client";

import { cn } from "@v2/lib/utils";

interface PercentBarProps {
	value: number;
	barClassName?: string;
	className?: string;
}

function PercentBar({ value, barClassName, className }: PercentBarProps) {
	const pct = Math.max(0, Math.min(100, value));
	return (
		<div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-v2-bg-warm", className)}>
			<div
				role="progressbar"
				aria-valuenow={Math.round(pct)}
				aria-valuemin={0}
				aria-valuemax={100}
				className={cn("h-full w-(--bar) rounded-full transition-all", barClassName)}
				style={{ "--bar": `${pct}%` }}
			/>
		</div>
	);
}
PercentBar.displayName = "PercentBar";

export { PercentBar, type PercentBarProps };
