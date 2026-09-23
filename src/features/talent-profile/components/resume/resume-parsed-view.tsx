"use client";

import { Card } from "@v2/components/ui/card";
import { cn } from "@v2/lib/utils";
import type { StructuredResumeData } from "@/utils/resumeUtils";
import { AchievementsSection } from "./parsed/achievements-section";
import { EducationSection } from "./parsed/education-section";
import { LanguagesSection } from "./parsed/languages-section";
import { SkillsSection } from "./parsed/skills-section";
import { WorkExperienceSection } from "./parsed/work-experience-section";

interface ResumeParsedViewProps {
	data: StructuredResumeData;
	className?: string;
}

function ResumeParsedView({
	data: { meta_info, employment_history, education, skills, languages },
	className,
}: ResumeParsedViewProps) {
	return (
		<div className={cn("space-y-3", className)}>
			{meta_info?.professional_summary && (
				<Card variant="flat" className="p-4">
					<p className="font-v2-body text-xs leading-relaxed text-v2-text-secondary whitespace-pre-line">
						{meta_info.professional_summary}
					</p>
				</Card>
			)}

			{employment_history && <WorkExperienceSection employmentHistory={employment_history} />}
			<EducationSection education={education} />
			<SkillsSection skills={skills} />
			<LanguagesSection languages={languages} />
			{meta_info?.achievements && <AchievementsSection achievements={meta_info.achievements} />}
		</div>
	);
}
ResumeParsedView.displayName = "ResumeParsedView";

export { ResumeParsedView };
