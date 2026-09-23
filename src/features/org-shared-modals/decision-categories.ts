import { COMPANY_INTEREST_CATEGORY_IDS, type CompanyInterestCategoryId } from "@clera/shared-types";
import { COMPANY_NO_FIT_CATEGORIES } from "./no-fit-categories";

export interface DecisionCategory {
	id: string;
	label: string;
}

const INTEREST_DISPLAY: Record<CompanyInterestCategoryId, string> = {
	strong_stack_match: "Strong stack match",
	great_trajectory: "Great trajectory",
	domain_fit: "Domain expertise",
	founder_energy: "Founder energy",
};

export const INTRO_DECISION_CATEGORIES: DecisionCategory[] = COMPANY_INTEREST_CATEGORY_IDS.map((id) => ({
	id,
	label: INTEREST_DISPLAY[id],
}));

export const PASS_DECISION_CATEGORIES: DecisionCategory[] = COMPANY_NO_FIT_CATEGORIES.map(({ id, label }) => ({
	id,
	label,
}));
