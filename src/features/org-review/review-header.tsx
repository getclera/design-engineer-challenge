"use client";

import { PercentBar } from "@v2/components/data-display";

interface ReviewHeaderProps {
	remaining: number;
	reviewed: number;
	truncated?: boolean;
}

export function ReviewHeader({ remaining, reviewed, truncated }: ReviewHeaderProps) {
	const remainingLabel = truncated ? `${remaining}+` : String(remaining);
	const total = reviewed + remaining;
	const progress = total > 0 ? Math.round((reviewed / total) * 100) : 0;
	return (
		<div className="relative flex flex-col gap-3 border-b border-v2-border-divider px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
			<div className="min-w-0">
				<h2 className="font-v2-heading text-lg text-v2-text-primary">Unreviewed</h2>
				<p className="font-v2-body text-xs text-v2-text-tertiary">
					Weekly &amp; public drops, role-specific picks, and intro requests. Pass or request an intro.
				</p>
			</div>
			<span className="shrink-0 font-v2-body text-xs text-v2-text-tertiary tabular-nums">
				{reviewed > 0 ? `${reviewed} done · ${remainingLabel} left` : `${remainingLabel} to review`}
			</span>
			{reviewed > 0 && (
				<PercentBar
					value={progress}
					className="absolute inset-x-0 bottom-0 h-0.5 rounded-none bg-v2-border-divider"
					barClassName="rounded-none bg-v2-brand-green"
				/>
			)}
		</div>
	);
}

ReviewHeader.displayName = "ReviewHeader";
