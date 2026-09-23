import { DEFAULT_ORG_TALENT_FILTERS } from "./types";

export const orgTalentSearchFiltersKey = (orgId: string) => `org-talent-search-filters:${orgId}`;

export const ORG_TALENT_SEARCH_PAGE = 1;

export const ORG_TALENT_SEARCH_PER_PAGE = 50;

export const ORG_TALENT_SEARCH_FILTER_PARAMS = Object.keys(DEFAULT_ORG_TALENT_FILTERS);
