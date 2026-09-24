export const orgReviewFiltersKey = (orgId: string) => `org-review-filters:${orgId}`;

export const ALL_ROLES_PARAM = "all";

export const ORG_REVIEW_FILTER_PARAMS = ["role", "view", "streams"] as const;

export const REVIEW_CONTROL_BAR_CLASSES = "flex flex-wrap items-center gap-3";

/** The next card peeking out under the deck card (deck and its skeleton). */
export const REVIEW_DECK_GHOST_CLASSES =
	"absolute inset-x-3 top-3 -bottom-2 rounded-v2-lg border border-v2-border-warm bg-v2-bg-card";

export {
	MASTER_DETAIL_GRID_CLASSES as REVIEW_BOARD_GRID_CLASSES,
	MASTER_DETAIL_LEFT_CARD_CLASSES as REVIEW_LEFT_CARD_CLASSES,
} from "@v2/components/layout";
