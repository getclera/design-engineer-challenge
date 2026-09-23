"use client";

import { Translate } from "@phosphor-icons/react";
import { SubsectionHeader } from "@v2/components/data-display";
import { Card } from "@v2/components/ui/card";
import { Tag } from "@v2/components/ui/tag";
import type { StructuredResumeData } from "@/utils/resumeUtils";

interface LanguagesSectionProps {
	languages: StructuredResumeData["languages"];
}

function LanguagesSection({ languages }: LanguagesSectionProps) {
	if (languages.length === 0) return null;

	return (
		<Card variant="flat" className="p-4">
			<SubsectionHeader icon={Translate} title="Languages" className="mb-2" />
			<div className="flex flex-wrap gap-1.5">
				{languages.map((lang) => (
					<Tag key={lang.id} variant="display" className="h-5.5 px-2 text-2xs">
						{lang.language_name}
						{lang.proficiency_level ? ` (${lang.proficiency_level})` : ""}
					</Tag>
				))}
			</div>
		</Card>
	);
}
LanguagesSection.displayName = "LanguagesSection";

export { LanguagesSection };
