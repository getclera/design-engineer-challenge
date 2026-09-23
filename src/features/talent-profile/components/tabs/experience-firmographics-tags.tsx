"use client";

import { Badge } from "@v2/components/ui/badge";
import { cn } from "@v2/lib/utils";
import { formatFundingAmount, formatFundingStage } from "@v2/utils/format";
import type { MergedProfile } from "@/services/api/talents";

type Experience = MergedProfile["experiences"][number];

interface ExperienceFirmographicsTagsProps {
	exp: Experience;
	showFundingAmount: boolean;
	className?: string;
}

const FIRMOGRAPHIC_PILL = "h-4.5 px-2 py-0 text-2xs";

function ExperienceFirmographicsTags({ exp, showFundingAmount, className }: ExperienceFirmographicsTagsProps) {
	const fundingAmount = exp.company.funding.amount ? formatFundingAmount(exp.company.funding.amount) : "";
	const employeeCount = exp.company.employeeCount && exp.company.employeeCount > 0 ? exp.company.employeeCount : null;

	if (!exp.company.funding.stage && !employeeCount && !exp.company.industry && !exp.company.foundedYear) {
		return null;
	}

	return (
		<div className={cn("flex flex-wrap items-center gap-1", className)}>
			{exp.company.funding.stage && (
				<Badge
					variant="status"
					className={`${FIRMOGRAPHIC_PILL} border-v2-status-active/30 bg-v2-status-active-bg text-v2-text-brand-green`}
				>
					{formatFundingStage(exp.company.funding.stage)}
					{showFundingAmount && fundingAmount && ` (${fundingAmount})`}
				</Badge>
			)}
			{employeeCount !== null && (
				<Badge variant="info" className={FIRMOGRAPHIC_PILL}>
					{employeeCount.toLocaleString()}+ team
				</Badge>
			)}
			{exp.company.industry && (
				<Badge variant="info" className={FIRMOGRAPHIC_PILL}>
					{exp.company.industry}
				</Badge>
			)}
			{exp.company.foundedYear && (
				<Badge variant="info" className={FIRMOGRAPHIC_PILL}>
					Founded {exp.company.foundedYear}
				</Badge>
			)}
		</div>
	);
}
ExperienceFirmographicsTags.displayName = "ExperienceFirmographicsTags";

export { ExperienceFirmographicsTags };
