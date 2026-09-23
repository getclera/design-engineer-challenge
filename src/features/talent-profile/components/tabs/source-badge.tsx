"use client";

import { Tag } from "@v2/components/ui/tag";
import { cn } from "@v2/lib/utils";

interface SourceBadgeProps {
	source: "linkedin" | "cv" | "manual" | "github";
	className?: string;
}

const SOURCE_BADGE_CONFIG = {
	cv: {
		label: "Resume",
		classes:
			"border-orange-400/30 bg-orange-50 text-orange-600 [[data-v2-theme=dark]_&]:bg-orange-950/30 [[data-v2-theme=dark]_&]:text-orange-400",
	},
	github: {
		label: "GitHub",
		classes:
			"border-purple-400/30 bg-purple-50 text-purple-600 [[data-v2-theme=dark]_&]:bg-purple-950/30 [[data-v2-theme=dark]_&]:text-purple-400",
	},
	manual: { label: "Manual", classes: "border-v2-border-warm bg-v2-bg-warm text-v2-text-muted" },
} as const;

function SourceBadge({ source, className }: SourceBadgeProps) {
	if (source === "linkedin") return null;

	const config = SOURCE_BADGE_CONFIG[source];

	return (
		<Tag
			variant="display"
			className={cn("h-4 px-1 text-2xs font-medium uppercase tracking-wider", config.classes, className)}
		>
			{config.label}
		</Tag>
	);
}
SourceBadge.displayName = "SourceBadge";

interface SourceBadgesProps {
	sources: ("linkedin" | "cv" | "manual" | "github")[];
	className?: string;
}

function SourceBadges({ sources, className }: SourceBadgesProps) {
	if (sources.includes("linkedin")) return null;
	return (
		<div className={cn("flex items-center gap-0.5", className)}>
			{sources.map((source) => (
				<SourceBadge key={source} source={source} />
			))}
		</div>
	);
}
SourceBadges.displayName = "SourceBadges";

export { SourceBadge, SourceBadges };
