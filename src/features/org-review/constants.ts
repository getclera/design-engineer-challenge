import { MASTER_DETAIL_RIGHT_CARD_CLASSES } from "@v2/components/layout";

export const orgReviewFiltersKey = (orgId: string) => `org-review-filters:${orgId}`;

export const ALL_ROLES_PARAM = "all";

export const ORG_REVIEW_FILTER_PARAMS = ["role", "view", "streams"] as const;

export const REVIEW_CONTROL_BAR_CLASSES = "flex flex-wrap items-center gap-3";

export const REVIEW_RIGHT_CARD_CLASSES = `${MASTER_DETAIL_RIGHT_CARD_CLASSES} overflow-visible`;

export {
	MASTER_DETAIL_GRID_CLASSES as REVIEW_BOARD_GRID_CLASSES,
	MASTER_DETAIL_LEFT_CARD_CLASSES as REVIEW_LEFT_CARD_CLASSES,
} from "@v2/components/layout";
