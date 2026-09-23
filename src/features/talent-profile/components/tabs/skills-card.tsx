"use client";

import { Code } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Card } from "@v2/components/ui/card";
import { cn } from "@v2/lib/utils";
import type { MergedProfile } from "@/services/api/talents";
import { ProfileCardHeader } from "./profile-card-header";
import { SourceBadges } from "./source-badge";

type Skill = MergedProfile["skills"][number];

interface SkillsCardProps {
	skills: Skill[];
	showSuggestButton?: boolean;
	onSuggestSkill?: () => void;
	className?: string;
}

function SkillsCard({ skills, showSuggestButton, onSuggestSkill, className }: SkillsCardProps) {
	if (skills.length === 0) return null;

	return (
		<Card variant="flat" className={cn("overflow-hidden", className)}>
			<ProfileCardHeader icon={Code} title="Skills">
				{showSuggestButton && (
					<Button variant="ghost" size="sm" className="text-xs" onClick={onSuggestSkill}>
						Suggest Skill
					</Button>
				)}
			</ProfileCardHeader>
			<div className="flex flex-wrap gap-1.5 border-t border-v2-border-warm/50 px-4 py-3 sm:px-5">
				{skills.map((skill) => (
					<div
						key={skill.name}
						className="flex items-center gap-1.5 rounded-v2-full border border-v2-border-warm px-2 py-0.5"
					>
						<span className="font-v2-body text-xs font-medium text-v2-text-primary">{skill.name}</span>
						<SourceBadges sources={skill.sources} />
					</div>
				))}
			</div>
		</Card>
	);
}
SkillsCard.displayName = "SkillsCard";

export { SkillsCard };
