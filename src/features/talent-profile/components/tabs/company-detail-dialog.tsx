"use client";

import { cleanLinkedinCompanyName } from "@clera/shared-utils";
import { ArrowSquareOut, Globe } from "@phosphor-icons/react";
import { FieldLabel, TagList } from "@v2/components/data-display";
import { Button } from "@v2/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@v2/components/ui/dialog";
import { LogoWithFallback } from "@v2/components/ui/logo-with-fallback";
import { cleanField, formatNumber, humanizeKey } from "@v2/utils/format";
import { type Company, employeesLabel, fundingLabel, lastRoundLabel } from "../../utils/company-labels";
import { ensureProtocol, extractHost } from "../../utils/external-links";

interface CompanyDetailDialogProps {
	company: Company;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function buildDetails(company: Company): { label: string; value: string }[] {
	const candidates: { label: string; value: string | null }[] = [
		{ label: "Industry", value: cleanField(company.industry) },
		{ label: "Team size", value: employeesLabel(company) },
		{ label: "Headquarters", value: cleanField(company.primaryLocation) },
		{ label: "Country", value: cleanField(company.country) },
		{ label: "Founded", value: company.foundedYear ? String(company.foundedYear) : null },
		{ label: "Company type", value: company.companyType ? humanizeKey(company.companyType) : null },
		{ label: "Status", value: company.operatingStatus ? humanizeKey(company.operatingStatus) : null },
		{ label: "IPO status", value: company.ipoStatus ? humanizeKey(company.ipoStatus) : null },
		{ label: "Funding", value: fundingLabel(company) },
		{ label: "Rounds", value: company.funding.rounds ? formatNumber(company.funding.rounds) : null },
		{ label: "Last round", value: lastRoundLabel(company) },
	];
	return candidates.filter((item): item is { label: string; value: string } => Boolean(item.value));
}

function CompanyDetailDialog({ company, open, onOpenChange }: CompanyDetailDialogProps) {
	const name = cleanLinkedinCompanyName(company.name);
	const oneLiner = cleanField(company.oneLiner);
	const description = cleanField(company.description);
	const focusAreas = company.industries.length > 0 ? company.industries : company.categories;
	const details = buildDetails(company);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="md:max-w-lg">
				<DialogHeader className="flex-row items-center gap-3">
					<LogoWithFallback
						src={company.logoUrl}
						alt={name ? `${name} logo` : "Company logo"}
						fallbackInitial={(name || "?")[0]}
						sizeClassName="size-12"
						className="shrink-0"
					/>
					<div className="flex min-w-0 flex-col gap-0.5">
						<DialogTitle className="truncate text-lg">{name || "Company"}</DialogTitle>
						{oneLiner && <p className="truncate font-v2-body text-sm text-v2-text-secondary">{oneLiner}</p>}
					</div>
				</DialogHeader>
				<DialogBody className="space-y-5">
					{details.length > 0 && (
						<dl className="grid grid-cols-2 gap-x-6 gap-y-3.5">
							{details.map((item) => (
								<div key={item.label} className="min-w-0">
									<FieldLabel className="text-2xs uppercase tracking-wide">{item.label}</FieldLabel>
									<dd className="font-v2-body text-sm text-v2-text-primary">{item.value}</dd>
								</div>
							))}
						</dl>
					)}
					{focusAreas.length > 0 && (
						<div className="space-y-1.5">
							<FieldLabel className="text-2xs uppercase tracking-wide">Focus areas</FieldLabel>
							<TagList items={focusAreas} maxVisible={8} variant="display" tagClassName="text-xs" />
						</div>
					)}
					{description && (
						<div className="space-y-1.5">
							<FieldLabel className="text-2xs uppercase tracking-wide">About</FieldLabel>
							<p className="font-v2-body text-sm leading-relaxed text-v2-text-secondary">{description}</p>
						</div>
					)}
				</DialogBody>
				{(company.url || company.website) && (
					<DialogFooter>
						{company.website && (
							<Button asChild variant="ghost">
								<a href={ensureProtocol(company.website)} target="_blank" rel="noopener noreferrer">
									<Globe size={14} weight="regular" aria-hidden="true" />
									{extractHost(company.website) || "Website"}
								</a>
							</Button>
						)}
						{company.url && (
							<Button asChild variant="primary">
								<a href={company.url} target="_blank" rel="noopener noreferrer">
									View on LinkedIn
									<ArrowSquareOut size={14} weight="bold" aria-hidden="true" />
								</a>
							</Button>
						)}
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
CompanyDetailDialog.displayName = "CompanyDetailDialog";

export { CompanyDetailDialog };
