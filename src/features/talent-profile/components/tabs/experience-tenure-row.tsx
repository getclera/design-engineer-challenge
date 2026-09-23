"use client";

import { cleanLinkedinCompanyName, type EmployerGroup, formatMonthsDuration } from "@clera/shared-utils";
import { cleanField, collapseWhitespace } from "@v2/utils/format";
import { useState } from "react";
import type { MergedProfile } from "@/services/api/talents";
import { CompanyDetailDialog } from "./company-detail-dialog";
import { ExperienceFirmographicsTags } from "./experience-firmographics-tags";
import { ExperienceRoleLine } from "./experience-role-line";
import { ExperienceRow } from "./experience-row";
import { SourceBadges } from "./source-badge";
import { TimelineRow } from "./timeline-row";

type Experience = MergedProfile["experiences"][number];

interface ExperienceTenureRowProps {
	tenure: EmployerGroup<Experience>;
	showFundingAmount: boolean;
}

function ExperienceTenureRow({ tenure, showFundingAmount }: ExperienceTenureRowProps) {
	const [latest] = tenure.roles;
	const companyName = cleanLinkedinCompanyName(tenure.companyName);
	const companyOneLiner = collapseWhitespace(cleanField(latest.company.oneLiner));
	const sources = [...new Set(tenure.roles.flatMap((role) => role.sources))];
	const [companyOpen, setCompanyOpen] = useState(false);

	if (tenure.roles.length === 1) {
		return <ExperienceRow exp={latest} showFundingAmount={showFundingAmount} />;
	}

	return (
		<>
			<TimelineRow
				logoSrc={latest.company.logoUrl}
				logoAlt={companyName ? `${companyName} logo` : "Company logo"}
				logoFallback={(companyName || latest.title)?.[0]?.toUpperCase() ?? "?"}
				onLogoClick={() => setCompanyOpen(true)}
				title={
					<button // v2-precheck-ignore raw-html-form
						type="button"
						onClick={() => setCompanyOpen(true)}
						className="text-left font-v2-heading text-xs font-semibold leading-snug text-v2-text-primary hover:underline"
					>
						{companyName}
					</button>
				}
				subtitle={
					<div className="flex items-start gap-1.5 font-v2-body text-2xs text-v2-text-secondary">
						<SourceBadges sources={sources} />
						{companyOneLiner && (
							<span className="min-w-0 line-clamp-2 text-v2-text-muted" title={companyOneLiner}>
								{companyOneLiner}
							</span>
						)}
					</div>
				}
				startDate={tenure.startDate}
				endDate={tenure.endDate}
				dateFormat="month-year"
				duration={formatMonthsDuration(tenure.totalTenureMonths)}
			>
				<ul className="mt-0.5 flex flex-col gap-1 border-l border-v2-border-warm/60 pl-1.5">
					{tenure.roles.map((role, index) => (
						<ExperienceRoleLine
							key={`${role.title}-${role.startDate}`}
							title={role.title}
							startDate={role.startDate}
							endDate={role.endDate}
							isLatest={index === 0}
							description={cleanField(role.description)}
							resumeBullets={role.bullets}
						/>
					))}
				</ul>
				<ExperienceFirmographicsTags exp={latest} showFundingAmount={showFundingAmount} className="mt-1.5" />
			</TimelineRow>
			<CompanyDetailDialog company={latest.company} open={companyOpen} onOpenChange={setCompanyOpen} />
		</>
	);
}
ExperienceTenureRow.displayName = "ExperienceTenureRow";

export { ExperienceTenureRow };
