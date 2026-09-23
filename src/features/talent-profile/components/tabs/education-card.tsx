"use client";

import { GraduationCap, Star } from "@phosphor-icons/react";
import { Card } from "@v2/components/ui/card";
import { Skeleton } from "@v2/components/ui/skeleton";
import { cn } from "@v2/lib/utils";
import { cleanField } from "@v2/utils/format";
import type { MergedProfile } from "@/services/api/talents";
import { getBestTagId, getUniversityRankingBadge } from "@/utils/linkedinUtils";
import { ProfileCardHeader } from "./profile-card-header";
import { SourceBadges } from "./source-badge";
import { TimelineRow } from "./timeline-row";

type Education = MergedProfile["education"][number];

interface EducationCardProps {
	education: Education[];
	isLoading?: boolean;
	className?: string;
}

function totalEducationYears(entries: Education[]): number | null {
	const withDates = entries.filter((e): e is Education & { startDate: string } => !!e.startDate);
	if (withDates.length === 0) return null;
	let total = 0;
	for (const e of withDates) {
		const s = new Date(e.startDate).getTime();
		const end = e.endDate ? new Date(e.endDate).getTime() : Date.now();
		total += Math.max(0, end - s);
	}
	const years = Math.round(total / (1000 * 60 * 60 * 24 * 365.25));
	return years > 0 ? years : null;
}

function EducationCard({ education, isLoading, className }: EducationCardProps) {
	const eduYears = education.length > 0 ? totalEducationYears(education) : null;

	return (
		<Card variant="flat" className={cn("overflow-hidden", className)}>
			<ProfileCardHeader icon={GraduationCap} title="Education">
				{eduYears && (
					<span className="font-v2-body text-xs text-v2-text-muted">
						{eduYears} {eduYears === 1 ? "year" : "years"}
					</span>
				)}
			</ProfileCardHeader>

			{isLoading ? (
				<div className="flex flex-col gap-px border-t border-v2-border-warm/50">
					<EducationSkeleton />
					<EducationSkeleton />
				</div>
			) : education.length === 0 ? (
				<div className="px-4 pb-3 sm:px-5">
					<p className="font-v2-body text-xs text-v2-text-muted">No education data available.</p>
				</div>
			) : (
				<div className="flex flex-col gap-px border-t border-v2-border-warm/50">
					{education.map((edu, index) => (
						<EducationRow key={`${edu.school.name}-${edu.degree}-${edu.startDate}-${index}`} edu={edu} />
					))}
				</div>
			)}
		</Card>
	);
}
EducationCard.displayName = "EducationCard";

function EducationRow({ edu }: { edu: Education }) {
	const name = edu.school.name;
	const detail = [cleanField(edu.degree), cleanField(edu.fieldOfStudy), edu.gpa ? `GPA: ${edu.gpa}` : null]
		.filter(Boolean)
		.join(", ");
	const bestTag = getBestTagId(edu.school.tagIds);
	const ranking = bestTag ? getUniversityRankingBadge(bestTag) : null;

	return (
		<TimelineRow
			logoSrc={edu.school.logoUrl}
			logoAlt={name ? `${name} logo` : "School logo"}
			logoFallback={(name?.[0] ?? "?").toUpperCase()}
			logoHref={edu.school.url}
			title={
				<div className="flex items-center gap-2">
					<span className="font-v2-heading text-xs font-semibold leading-snug text-v2-text-primary">{name}</span>
					<SourceBadges sources={edu.sources} />
					{ranking && (
						<span className="inline-flex items-center gap-1 rounded-v2-full border border-v2-status-warning/30 bg-v2-status-warning-bg px-1.5 py-px text-2xs font-medium uppercase tracking-wider text-v2-status-warning">
							<Star size={8} weight="fill" />
							{ranking} globally
						</span>
					)}
				</div>
			}
			subtitle={detail ? <span className="font-v2-body text-2xs text-v2-text-secondary">{detail}</span> : undefined}
			startDate={edu.startDate}
			endDate={edu.endDate}
			dateFormat="year"
			durationTone="neutral"
		/>
	);
}
EducationRow.displayName = "EducationRow";

function EducationSkeleton() {
	return (
		<div className="flex gap-3 px-4 py-2.5 sm:px-5">
			<Skeleton className="size-11 shrink-0 rounded-v2-md" />
			<div className="flex flex-1 flex-col gap-1.5">
				<Skeleton className="h-3.5 w-44" />
				<Skeleton className="h-3 w-28" />
			</div>
		</div>
	);
}
EducationSkeleton.displayName = "EducationSkeleton";

export { EducationCard };
