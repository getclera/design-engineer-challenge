export const orgReviewFiltersKey = (orgId: string) => `org-review-filters:${orgId}`;

export const ALL_ROLES_PARAM = "all";

export const ORG_REVIEW_FILTER_PARAMS = ["role", "view", "streams"] as const;

export const REVIEW_CONTROL_BAR_CLASSES = "flex flex-wrap items-center gap-3";

/** Desktop: the list stops at 400px and the card at 800px, kept on the left (phone fills the screen). */
export const REVIEW_BOARD_MAX_W = "lg:max-w-302.5";
export const REVIEW_BOARD_MAX_W_NO_LIST = "lg:max-w-200";
export const REVIEW_BOARD_COLUMNS = "lg:grid-cols-[minmax(0,400px)_minmax(0,800px)]";

const GHOST = "absolute inset-0 rounded-v2-lg border border-v2-border-warm bg-v2-bg-card transition-transform";
/** The next two cards peeking out under the deck card, farthest first so the nearest paints on top (deck and its skeleton). */
export const REVIEW_DECK_GHOST_CLASSES = [
	`${GHOST} translate-y-6 scale-[.91] opacity-60`,
	`${GHOST} translate-y-3 scale-[.955] opacity-85`,
];

export {
	MASTER_DETAIL_GRID_CLASSES as REVIEW_BOARD_GRID_CLASSES,
	MASTER_DETAIL_LEFT_CARD_CLASSES as REVIEW_LEFT_CARD_CLASSES,
} from "@v2/components/layout";
