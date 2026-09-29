"use client";

import { SidebarSimple } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";

interface ReviewHeaderProps {
	maybe?: boolean;
	/** Shows a "hide list" icon button (desktop). */
	onHide?: () => void;
}

// The count and progress live above the card (review-deck-stage), not here.
export function ReviewHeader({ maybe = false, onHide }: ReviewHeaderProps) {
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
			{onHide && (
				<Button
					variant="unstyled"
					size="compact-icon"
					aria-label="Hide list"
					title="Hide list (L)"
					onClick={onHide}
					className="focus-ring -my-1 shrink-0 text-v2-text-tertiary hover:text-v2-text-primary"
				>
					<SidebarSimple size={16} />
				</Button>
			)}
		</div>
	);
}

ReviewHeader.displayName = "ReviewHeader";
