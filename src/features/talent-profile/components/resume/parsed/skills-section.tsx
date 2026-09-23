"use client";

import { Trophy } from "@phosphor-icons/react";
import { SubsectionHeader } from "@v2/components/data-display";
import { Card } from "@v2/components/ui/card";
import { Tag } from "@v2/components/ui/tag";
import type { StructuredResumeData } from "@/utils/resumeUtils";

interface SkillsSectionProps {
	skills: StructuredResumeData["skills"];
}

function SkillsSection({ skills }: SkillsSectionProps) {
	if (skills.length === 0) return null;

	return (
		<Card variant="flat" className="p-4">
			<SubsectionHeader icon={Trophy} title="Skills" className="mb-2" />
			<div className="flex flex-wrap gap-1.5">
				{skills.map((skill) => (
					<Tag key={skill.id} variant="display" className="h-5.5 px-2 text-2xs">
						{skill.skill_name}
						{skill.months_experience ? ` (${Math.round(skill.months_experience / 12)}y)` : ""}
					</Tag>
				))}
			</div>
		</Card>
	);
}
SkillsSection.displayName = "SkillsSection";

export { SkillsSection };
