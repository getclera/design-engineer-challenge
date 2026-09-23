export enum RELOCATION_OPTIONS {
	NO = "No",
	WITHIN_MY_COUNTRY = "Within my country",
	WITHIN_MY_CONTINENT = "Within my continent",
	EVERYWHERE = "Everywhere",
}

export enum JOB_TYPES {
	FULL_TIME = "Full-Time",
	PART_TIME = "Part-time",
	INTERNSHIP = "Internship",
	CONTRACT = "Contract",
	FREELANCE = "Freelance",
}

export enum CURRENCY_OPTIONS {
	USD = "USD",
	EUR = "EUR",
	GBP = "GBP",
	JPY = "JPY",
	AUD = "AUD",
	CAD = "CAD",
	CHF = "CHF",
	CNY = "CNY",
	INR = "INR",
	SGD = "SGD",
	BRL = "BRL",
	MXN = "MXN",
	PLN = "PLN",
	SEK = "SEK",
	DKK = "DKK",
	NOK = "NOK",
	ARS = "ARS",
	COP = "COP",
	PEN = "PEN",
	KES = "KES",
	PHP = "PHP",
}

export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"] as const;
export const FUNDING_STAGES = [
	"Bootstrapped",
	"Pre-seed",
	"Seed",
	"Series A",
	"Series B",
	"Series C",
	"Series D",
	"Series E",
	"Public",
	"Other",
] as const;
export const INDUSTRIES = [
	"AI",
	"Fintech",
	"Healthtech",
	"Hardware",
	"Edtech",
	"SaaS",
	"E-commerce",
	"Marketplace",
	"Cybersecurity",
	"Climate",
	"Biotech",
	"Mobility",
	"Gaming",
	"Media",
	"Defense",
	"Aerospace",
	"Government",
	"Other",
] as const;

export const RELOCATION_OPTIONS_VALUES = Object.values(RELOCATION_OPTIONS) as [string, ...string[]];
export const JOB_TYPES_VALUES = Object.values(JOB_TYPES) as [string, ...string[]];
export type CurrencyCode = `${CURRENCY_OPTIONS}`;
export const CURRENCY_OPTIONS_VALUES = Object.values(CURRENCY_OPTIONS) as [CurrencyCode, ...CurrencyCode[]];

const CURRENCY_SYMBOL_TO_CODE: Record<string, CurrencyCode> = {
	$: CURRENCY_OPTIONS.USD,
	"€": CURRENCY_OPTIONS.EUR,
	"£": CURRENCY_OPTIONS.GBP,
	"₹": CURRENCY_OPTIONS.INR,
};
const CURRENCY_CODE_SET = new Set<string>(CURRENCY_OPTIONS_VALUES);

export function normalizeCurrencyCode(value: string | null | undefined): CurrencyCode | null {
	const trimmed = value?.trim();
	if (!trimmed) return null;
	const bySymbol = CURRENCY_SYMBOL_TO_CODE[trimmed];
	if (bySymbol) return bySymbol;
	const leadingCode = trimmed.toUpperCase().slice(0, 3);
	return CURRENCY_CODE_SET.has(leadingCode) && !/[A-Z]/.test(trimmed.slice(3, 4))
		? (leadingCode as CurrencyCode)
		: null;
}

export const JOB_SEARCH_STATUSES = ["active", "passive", "not_looking", "not_looking_lost"] as const;
export type JobSearchStatus = (typeof JOB_SEARCH_STATUSES)[number];
