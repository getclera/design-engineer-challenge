"use client";

import { Sliders } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { InfoTooltip, SectionHeading } from "@v2/components/data-display";
import { Card } from "@v2/components/ui/card";
import { Skeleton } from "@v2/components/ui/skeleton";
import { Tag } from "@v2/components/ui/tag";
import { cn } from "@v2/lib/utils";
import { shortenLocation } from "@v2/utils/format";
import { talentKeys } from "@/lib/query-keys";
import { unwrap } from "@/services/api";
import { type PreferencesData, talents } from "@/services/api/talents";
import { formatCompensation, formatVisaSponsorship } from "./preferences/preference-fields";

interface PreferencesOverviewCardProps {
	talentId?: string;
	data?: PreferencesData;
	visaDetails?: string | null;
	className?: string;
}

function PreferencesOverviewCard({ talentId, data: dataProp, visaDetails, className }: PreferencesOverviewCardProps) {
	const { data: fetched, isLoading } = useQuery({
		queryKey: talentKeys.preferencesData(talentId ?? ""),
		queryFn: () => talents.fetchPreferencesData(talentId!).then(unwrap),
		staleTime: 5 * 60 * 1000,
		enabled: !!talentId && !dataProp,
	});

	const prefs = dataProp ?? fetched;

	if (!dataProp && isLoading) return <PreferencesOverviewSkeleton className={className} />;
	if (!prefs) return null;

	const salaryText = formatCompensation(prefs);
	const visaText = formatVisaSponsorship(prefs.visaSponsorshipNeeded);

	const allRows: Array<{ label: string; values: string[]; display: "tags" | "text"; tooltip?: string | null }> = [
		{ label: "Roles", values: prefs.roles, display: "tags" },
		{ label: "Job types", values: prefs.jobTypes, display: "tags" },
		{ label: "Locations", values: prefs.locations.map(shortenLocation), display: "tags" },
		{ label: "Work environment", values: prefs.workEnvironment, display: "text" },
		{
			label: "Visa sponsorship",
			values: visaText ? [visaText] : [],
			display: "text",
			tooltip: visaDetails,
		},
		{ label: "Willing to relocate", values: prefs.willingnessToRelocate, display: "text" },
		...(salaryText ? [{ label: "Compensation", values: [salaryText], display: "text" as const }] : []),
		{ label: "Company size", values: prefs.companySize, display: "text" },
		{ label: "Industry", values: prefs.industries, display: "tags" },
	];
	const rows = allRows.filter((row) => row.values.length > 0);

	if (rows.length === 0) return null;

	return (
		<Card variant="flat" className={cn("overflow-hidden", className)}>
			<div className="flex items-center gap-2 px-4 py-3 sm:px-5">
				<Sliders size={16} className="text-v2-text-secondary" />
				<SectionHeading as="h3" className="text-base">
					Preferences
				</SectionHeading>
			</div>

			<div className="border-t border-v2-border-warm/50">
				{rows.map((row) => (
					<div
						key={row.label}
						className="flex items-baseline gap-4 border-b border-v2-border-warm/30 px-4 py-2 last:border-b-0 sm:px-5"
					>
						<span className="w-28 shrink-0 font-v2-body text-2xs font-medium uppercase tracking-wider text-v2-text-muted">
							{row.label}
						</span>
						<div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
							{row.display === "tags" ? (
								row.values.map((v, i) => (
									<Tag key={`${v}-${i}`} variant="display" className="h-6 px-2 text-2xs">
										{v}
									</Tag>
								))
							) : (
								<span className="font-v2-body text-xs font-medium text-v2-text-primary">{row.values.join(" · ")}</span>
							)}
							{row.tooltip && <InfoTooltip>{row.tooltip}</InfoTooltip>}
						</div>
					</div>
				))}
			</div>
		</Card>
	);
}
PreferencesOverviewCard.displayName = "PreferencesOverviewCard";

function PreferencesOverviewSkeleton({ className }: { className?: string }) {
	return (
		<Card variant="flat" className={cn("overflow-hidden", className)}>
			<div className="flex items-center gap-2 px-4 py-3 sm:px-5">
				<Skeleton className="size-4 rounded-v2-sm" />
				<Skeleton className="h-4 w-24" />
			</div>
			<div className="border-t border-v2-border-warm/50">
				{Array.from({ length: 4 }, (_, i) => (
					<div
						key={i}
						className="flex items-center gap-4 border-b border-v2-border-warm/30 px-4 py-2 last:border-b-0 sm:px-5"
					>
						<Skeleton className="h-3 w-28 shrink-0" />
						<div className="flex gap-1.5">
							<Skeleton className="h-6 w-16 rounded-v2-sm" />
							<Skeleton className="h-6 w-12 rounded-v2-sm" />
						</div>
					</div>
				))}
			</div>
		</Card>
	);
}
PreferencesOverviewSkeleton.displayName = "PreferencesOverviewSkeleton";

export { PreferencesOverviewCard };
