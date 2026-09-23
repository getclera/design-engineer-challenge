"use client";

import { formatMonthYear } from "@clera/shared-utils";
import { Briefcase } from "@phosphor-icons/react";
import { SubsectionHeader } from "@v2/components/data-display";
import { Card } from "@v2/components/ui/card";
import { cn } from "@v2/lib/utils";
import type { StructuredResumeData } from "@/utils/resumeUtils";

type EmploymentHistory = NonNullable<StructuredResumeData["employment_history"]>;

interface WorkExperienceSectionProps {
	employmentHistory: EmploymentHistory;
}

function WorkExperienceSection({
	employmentHistory: { positions, months_of_work_experience },
}: WorkExperienceSectionProps) {
	if (!positions || positions.length === 0) return null;

	const totalYears = Math.round((months_of_work_experience ?? 0) / 12);

	return (
		<Card variant="flat" className="overflow-hidden">
			<div className="px-4 py-3">
				<SubsectionHeader icon={Briefcase} title="Work Experience" />
				{totalYears > 0 && <span className="font-v2-body text-2xs text-v2-text-muted ml-5">{totalYears}y total</span>}
			</div>
			<div className="border-t border-v2-border-warm/50">
				{positions.map((position, idx) => (
					<div key={position.id} className={cn("px-4 py-2.5", idx > 0 && "border-t border-v2-border-warm/30")}>
						<div className="flex items-start justify-between gap-2">
							<div className="min-w-0">
								<p className="font-v2-heading text-xs font-semibold text-v2-text-primary truncate">
									{String(position.job_title || "Untitled position")}
								</p>
								<p className="font-v2-body text-2xs text-v2-text-secondary">
									{position.employer_name || "Unknown employer"}
								</p>
							</div>
							<span className="font-v2-body text-2xs text-v2-text-muted whitespace-nowrap">
								{position.start_date ? formatMonthYear(position.start_date) : ""}
								{" - "}
								{position.is_current ? "Present" : position.end_date ? formatMonthYear(position.end_date) : ""}
							</span>
						</div>
						{position.description && (
							<p className="mt-1 font-v2-body text-2xs leading-relaxed text-v2-text-muted line-clamp-3">
								{position.description}
							</p>
						)}
					</div>
				))}
			</div>
		</Card>
	);
}
WorkExperienceSection.displayName = "WorkExperienceSection";

export { WorkExperienceSection };
