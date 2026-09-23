import type { TalentServiceDirect } from "@edge-functions/talent-service/service";

type BooleanSuggestParams = Parameters<typeof TalentServiceDirect.search.list_boolean_suggestions>[0];
type BooleanSuggestOutput = Awaited<ReturnType<typeof TalentServiceDirect.search.list_boolean_suggestions>>;

export type BooleanSearchScope = BooleanSuggestParams["scope"];
export type BooleanSearchSuggestionRaw = BooleanSuggestOutput["suggestions"][number];

export interface BooleanSearchSuggestion {
	value: string;
	scope: BooleanSearchScope;
	scopeLabel: string;
	count?: number;
}

export interface BooleanSearchTag {
	id: string;
	value: string;
	scope: BooleanSearchScope;
	excluded: boolean;
}

export interface BooleanSuggestSource {
	fetchSuggestions: (args: {
		query: string;
		scope: BooleanSearchScope;
		limit: number;
	}) => Promise<BooleanSearchSuggestion[]>;
	queryKey: (query: string, scope: BooleanSearchScope, limit: number) => readonly unknown[];
}

interface ScopeConfig {
	label: string;
	badgeLabel: string;
	tone: { bg: string; text: string };
}

const TONE_NEUTRAL = { bg: "bg-v2-status-neutral-bg", text: "text-v2-status-neutral" };
const TONE_INFO = { bg: "bg-v2-status-info-bg", text: "text-v2-status-info" };
const TONE_ACTIVE = { bg: "bg-v2-status-active-bg", text: "text-v2-status-active" };
const TONE_WARNING = { bg: "bg-v2-status-warning-bg", text: "text-v2-status-warning" };
const TONE_TEAL = { bg: "bg-v2-bg-badge-teal", text: "text-v2-text-brand" };
const TONE_ERROR = { bg: "bg-v2-status-error-bg", text: "text-v2-status-error" };

export const SCOPE_CONFIGS: Record<BooleanSearchScope, ScopeConfig> = {
	all_fields: { label: "All Fields", badgeLabel: "ALL", tone: TONE_NEUTRAL },
	role_names: { label: "Roles", badgeLabel: "ROLE", tone: TONE_INFO },
	skills: { label: "Skills", badgeLabel: "SKILL", tone: TONE_ACTIVE },
	education_history: { label: "Education", badgeLabel: "EDU", tone: TONE_WARNING },
	work_history: { label: "Company", badgeLabel: "COMP", tone: TONE_TEAL },
	location: { label: "Location", badgeLabel: "LOC", tone: TONE_ERROR },
	languages: { label: "Languages", badgeLabel: "LANG", tone: TONE_INFO },
	current_titles: { label: "Current title", badgeLabel: "NOW", tone: TONE_INFO },
	current_companies: { label: "Current company", badgeLabel: "CUR", tone: TONE_TEAL },
	company_industries: { label: "Industry", badgeLabel: "IND", tone: TONE_TEAL },
	company_tags: { label: "Company tag", badgeLabel: "TAG", tone: TONE_TEAL },
	fields_of_study: { label: "Field of study", badgeLabel: "FIELD", tone: TONE_WARNING },
	certifications: { label: "Certification", badgeLabel: "CERT", tone: TONE_ACTIVE },
};

export const SCOPE_ORDER: BooleanSearchScope[] = [
	"all_fields",
	"role_names",
	"current_titles",
	"skills",
	"education_history",
	"fields_of_study",
	"work_history",
	"current_companies",
	"company_industries",
	"company_tags",
	"certifications",
	"location",
	"languages",
];

export const MAX_BOOLEAN_TAGS = 20;
