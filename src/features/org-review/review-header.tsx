"use client";

import { SidebarSimple } from "@phosphor-icons/react";
import { PercentBar } from "@v2/components/data-display";
import { Button } from "@v2/components/ui/button";

interface ReviewHeaderProps {
	remaining: number;
	reviewed: number;
	truncated?: boolean;
	maybe?: boolean;
	/** Shows a "hide list" icon button (desktop). */
	onHide?: () => void;
}

export function ReviewHeader({ remaining, reviewed, truncated, maybe = false, onHide }: ReviewHeaderProps) {
	const remainingLabel = truncated ? `${remaining}+` : String(remaining);
	const total = reviewed + remaining;
	const progress = total > 0 ? Math.round((reviewed / total) * 100) : 0;
	return (
		<div className="relative flex flex-col gap-3 border-b border-v2-border-divider px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
			<div className="min-w-0">
				<h2 className="font-v2-heading text-lg text-v2-text-primary">{maybe ? "Maybe" : "Unreviewed"}</h2>
				<p className="font-v2-body text-xs text-v2-text-tertiary">
					{maybe
						? "Parked. Decide whenever."
						: "Weekly & public drops, role-specific picks, and intro requests. Pass or request an intro."}
				</p>
			</div>
			<div className="flex shrink-0 items-center gap-1">
				<span className="font-v2-body text-xs text-v2-text-tertiary tabular-nums">
					{reviewed > 0 ? `${reviewed} done · ${remainingLabel} left` : `${remainingLabel} to review`}
				</span>
				{onHide && (
					<Button
						variant="unstyled"
						size="compact-icon"
						aria-label="Hide list"
						title="Hide list (L)"
						onClick={onHide}
						className="focus-ring -my-1 text-v2-text-tertiary hover:text-v2-text-primary"
					>
						<SidebarSimple size={16} />
					</Button>
				)}
			</div>
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
