"use client";

import { Button } from "@v2/components/ui/button";

const SEGMENT_BASE = "h-6 rounded-v2-full border-transparent px-3.5 text-xs transition-colors";
const ACTIVE_CLASSES = "bg-v2-brand-teal font-medium text-v2-text-inverse hover:bg-v2-brand-teal";
const INACTIVE_CLASSES = "bg-transparent text-v2-text-tertiary hover:text-v2-text-secondary";

export const REVIEW_VIEWS = [
	{ value: "unreviewed", label: "Unreviewed" },
	{ value: "maybe", label: "Maybe" },
	{ value: "passed", label: "Passed" },
] as const;
export type ReviewView = (typeof REVIEW_VIEWS)[number]["value"];

interface ReviewIncomingToggleProps {
	view: ReviewView;
	onChange: (view: ReviewView) => void;
}

export function ReviewIncomingToggle({ view, onChange }: ReviewIncomingToggleProps) {
	return (
		<div className="flex items-center overflow-hidden rounded-v2-full bg-v2-bg-active p-0.5">
			{REVIEW_VIEWS.map(({ value, label }) => (
				<Button
					key={value}
					variant="ghost"
					size="compact"
					aria-pressed={view === value}
					className={`${SEGMENT_BASE} ${view === value ? ACTIVE_CLASSES : INACTIVE_CLASSES}`}
					onClick={() => onChange(value)}
				>
					{label}
				</Button>
			))}
		</div>
	);
}

ReviewIncomingToggle.displayName = "ReviewIncomingToggle";
