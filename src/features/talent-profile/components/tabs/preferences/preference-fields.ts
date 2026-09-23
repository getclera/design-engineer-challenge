import { formatSalaryRange } from "@clera/shared-utils";
import type { PreferencesData } from "@/services/api/talents";

export const VISA_SPONSORSHIP_OPTIONS = [
	{ value: "true", label: "Required" },
	{ value: "false", label: "Not required" },
];

export function formatVisaSponsorship(needed: boolean | null): string | null {
	if (needed === null) return null;
	return VISA_SPONSORSHIP_OPTIONS.find((option) => option.value === String(needed))?.label ?? null;
}

type CompensationFields = Pick<PreferencesData, "salaryLowerBound" | "salaryUpperBound" | "salaryCurrency">;

export function formatCompensation(prefs: CompensationFields | undefined): string | null {
	if (!prefs) return null;
	const range = formatSalaryRange(prefs.salaryLowerBound, prefs.salaryUpperBound, prefs.salaryCurrency);
	return range ? `${range} ${prefs.salaryCurrency}` : null;
}
