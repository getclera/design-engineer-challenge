import { COMPANY_NO_FIT_CATEGORY_IDS, COMPANY_NO_FIT_CATEGORY_LABELS } from "@clera/shared-types";

export interface NoFitCategory {
	id: string;
	label: string;
}

export const COMPANY_NO_FIT_CATEGORIES: NoFitCategory[] = COMPANY_NO_FIT_CATEGORY_IDS.map((id) => ({
	id,
	label: COMPANY_NO_FIT_CATEGORY_LABELS[id],
}));
