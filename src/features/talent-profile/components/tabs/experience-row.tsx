"use client";

import { cleanLinkedinCompanyName } from "@clera/shared-utils";
import { cleanField, collapseWhitespace } from "@v2/utils/format";
import { useState } from "react";
import type { MergedProfile } from "@/services/api/talents";
import { CompanyDetailDialog } from "./company-detail-dialog";
import { ExperienceDetailsDisclosure } from "./experience-details-disclosure";
import { ExperienceFirmographicsTags } from "./experience-firmographics-tags";
import { SourceBadges } from "./source-badge";
import { TimelineRow } from "./timeline-row";

type Experience = MergedProfile["experiences"][number];

interface ExperienceRowProps {
	exp: Experience;
	showFundingAmount: boolean;
}

function ExperienceRow({ exp, showFundingAmount }: ExperienceRowProps) {
	const companyName = cleanLinkedinCompanyName(exp.company.name);
	const companyOneLiner = collapseWhitespace(cleanField(exp.company.oneLiner));
	const description = cleanField(exp.description);
	const [companyOpen, setCompanyOpen] = useState(false);

	return (
		<>
			<TimelineRow
				logoSrc={exp.company.logoUrl}
				logoAlt={companyName ? `${companyName} logo` : "Company logo"}
				logoFallback={(companyName || exp.title)?.[0]?.toUpperCase() ?? "?"}
				onLogoClick={() => setCompanyOpen(true)}
				title={
					<span className="font-v2-heading text-xs font-semibold leading-snug text-v2-text-primary">{exp.title}</span>
				}
				subtitle={
					<div className="flex items-start gap-1.5 font-v2-body text-2xs text-v2-text-secondary">
						{companyName && (
							<button // v2-precheck-ignore raw-html-form
								type="button"
								onClick={() => setCompanyOpen(true)}
								className="max-w-55 shrink-0 truncate text-left font-medium hover:underline"
							>
								{companyName}
							</button>
						)}
						<SourceBadges sources={exp.sources} className="shrink-0" />
						{companyOneLiner && (
							<>
								<span className="shrink-0 text-v2-text-muted">·</span>
								<span className="min-w-0 line-clamp-2 text-v2-text-muted" title={companyOneLiner}>
									{companyOneLiner}
								</span>
							</>
						)}
					</div>
				}
				startDate={exp.startDate}
				endDate={exp.endDate}
				dateFormat="month-year"
			>
				<ExperienceFirmographicsTags exp={exp} showFundingAmount={showFundingAmount} />
				<ExperienceDetailsDisclosure description={description} resumeBullets={exp.bullets} />
			</TimelineRow>
			<CompanyDetailDialog company={exp.company} open={companyOpen} onOpenChange={setCompanyOpen} />
		</>
	);
}
ExperienceRow.displayName = "ExperienceRow";

export { ExperienceRow };
