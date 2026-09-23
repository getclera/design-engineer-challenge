"use client";

import { Trophy } from "@phosphor-icons/react";
import { SubsectionHeader } from "@v2/components/data-display";
import { Card } from "@v2/components/ui/card";

interface AchievementsSectionProps {
	achievements: string[];
}

function AchievementsSection({ achievements }: AchievementsSectionProps) {
	if (achievements.length === 0) return null;

	return (
		<Card variant="flat" className="p-4">
			<SubsectionHeader icon={Trophy} title="Achievements" className="mb-2" />
			<ul className="space-y-1 pl-3">
				{achievements.map((achievement, idx) => (
					<li key={`achievement-${idx}`} className="font-v2-body text-2xs text-v2-text-secondary list-disc">
						{achievement}
					</li>
				))}
			</ul>
		</Card>
	);
}
AchievementsSection.displayName = "AchievementsSection";

export { AchievementsSection };
