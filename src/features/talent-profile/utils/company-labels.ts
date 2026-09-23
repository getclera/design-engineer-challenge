import { parseDate } from "@v2/utils/date";
import { formatFundingAmount, formatFundingStage, formatNumber } from "@v2/utils/format";
import type { MergedProfile } from "@/services/api/talents";

export type Company = MergedProfile["experiences"][number]["company"];

export function employeesLabel(company: Company): string | null {
	const { employeeRange, employeeCount } = company;
	if (employeeRange?.start && employeeRange.end) {
		return `${formatNumber(employeeRange.start)}–${formatNumber(employeeRange.end)}`;
	}
	if (employeeCount && employeeCount > 0) return `${formatNumber(employeeCount)}+`;
	return null;
}

export function fundingLabel(company: Company): string | null {
	const { stage, amount } = company.funding;
	if (!stage) return null;
	const money = amount ? formatFundingAmount(amount) : "";
	return money ? `${formatFundingStage(stage)} · ${money}` : formatFundingStage(stage);
}

export function lastRoundLabel(company: Company): string | null {
	const { lastType, lastAt } = company.funding;
	if (!lastType) return null;
	const year = parseDate(lastAt)?.getFullYear();
	const stage = formatFundingStage(lastType);
	return year ? `${stage} (${year})` : stage;
}
