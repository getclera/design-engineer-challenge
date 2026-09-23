"use client";

import { formatMonthYear } from "@clera/shared-utils";
import { GraduationCap } from "@phosphor-icons/react";
import { SubsectionHeader } from "@v2/components/data-display";
import { Card } from "@v2/components/ui/card";
import { cn } from "@v2/lib/utils";
import type { StructuredResumeData } from "@/utils/resumeUtils";

interface EducationSectionProps {
	education: StructuredResumeData["education"];
}

function EducationSection({ education }: EducationSectionProps) {
	if (education.length === 0) return null;

	return (
		<Card variant="flat" className="overflow-hidden">
			<div className="px-4 py-3">
				<SubsectionHeader icon={GraduationCap} title="Education" />
			</div>
			<div className="border-t border-v2-border-warm/50">
				{education.map((edu, idx) => (
					<div key={edu.id} className={cn("px-4 py-2.5", idx > 0 && "border-t border-v2-border-warm/30")}>
						<div className="flex items-start justify-between gap-2">
							<div className="min-w-0">
								<p className="font-v2-heading text-xs font-semibold text-v2-text-primary truncate">
									{edu.school_name || "Unknown school"}
								</p>
								<p className="font-v2-body text-2xs text-v2-text-secondary">{String(edu.degree_name || "")}</p>
								{edu.education_majors && edu.education_majors.length > 0 && (
									<p className="font-v2-body text-2xs text-v2-text-muted">
										{edu.education_majors.map((m) => m.major).join(", ")}
									</p>
								)}
							</div>
							<span className="font-v2-body text-2xs text-v2-text-muted whitespace-nowrap">
								{edu.start_date ? formatMonthYear(edu.start_date) : ""}
								{edu.start_date && edu.end_date ? " - " : ""}
								{edu.is_current ? "Present" : edu.end_date ? formatMonthYear(edu.end_date) : ""}
							</span>
						</div>
					</div>
				))}
			</div>
		</Card>
	);
}
EducationSection.displayName = "EducationSection";

export { EducationSection };
