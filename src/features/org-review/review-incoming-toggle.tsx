"use client";

import { Button } from "@v2/components/ui/button";

const SEGMENT_BASE = "h-6 rounded-v2-full border-transparent px-3.5 text-xs transition-colors";
const ACTIVE_CLASSES = "bg-v2-brand-teal font-medium text-v2-text-inverse hover:bg-v2-brand-teal";
const INACTIVE_CLASSES = "bg-transparent text-v2-text-tertiary hover:text-v2-text-secondary";

interface ReviewIncomingToggleProps {
	showPassed: boolean;
	onChange: (showPassed: boolean) => void;
}

export function ReviewIncomingToggle({ showPassed, onChange }: ReviewIncomingToggleProps) {
	return (
		<div className="flex items-center overflow-hidden rounded-v2-full bg-v2-bg-active p-0.5">
			<Button
				variant="ghost"
				size="compact"
				className={`${SEGMENT_BASE} ${showPassed ? INACTIVE_CLASSES : ACTIVE_CLASSES}`}
				onClick={() => onChange(false)}
			>
				Unreviewed
			</Button>
			<Button
				variant="ghost"
				size="compact"
				className={`${SEGMENT_BASE} ${showPassed ? ACTIVE_CLASSES : INACTIVE_CLASSES}`}
				onClick={() => onChange(true)}
			>
				Passed
			</Button>
		</div>
	);
}

ReviewIncomingToggle.displayName = "ReviewIncomingToggle";
