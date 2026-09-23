import { EMPLOYMENT_TYPES, normalizeEmploymentType } from "@clera/shared-types";
import { cleanCompanyName } from "./format.ts";
import { cleanSentinelField } from "./sentinel.ts";

export function parseEducationSubtitle(subtitle: string | null | undefined): {
	degree: string | null;
	fieldOfStudy: string | null;
} {
	if (subtitle === null || subtitle === undefined) return { degree: null, fieldOfStudy: null };
	const str = String(subtitle);
	const commaIndex = str.indexOf(",");
	if (commaIndex === -1) return { degree: cleanSentinelField(str), fieldOfStudy: null };
	return {
		degree: cleanSentinelField(str.slice(0, commaIndex)),
		fieldOfStudy: cleanSentinelField(str.slice(commaIndex + 1)),
	};
}

export function normalizeCompanyName(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/\s+(inc\.?|llc\.?|ltd\.?|gmbh|corp\.?|co\.?)$/i, "")
		.replace(/\s+/g, " ");
}

const COMPANY_DOMAIN_TLD = /\.(ai|io|com|co|dev|app|so|xyz|hq|net|org|tech|inc)\b/gi;

export function companyCoreName(name: string | null | undefined): string {
	if (!name) return "";
	return name
		.toLowerCase()
		.replace(COMPANY_DOMAIN_TLD, "")
		.replace(/[^a-z0-9]/g, "");
}

const LINKEDIN_EMPLOYMENT_TYPES = new Set(EMPLOYMENT_TYPES.map((t) => t.toLowerCase()));

const DURATION_ONLY_NAME = /^(\d+\s*yrs?(\s+\d+\s*mos?)?|\d+\s*mos?)$/i;

const SUFFIX_ONLY_EMPLOYMENT_TYPES = ["co-op"];

const EMPLOYMENT_TYPE_SUFFIX = new RegExp(
	`\\s*\\.\\s*((?:[A-Za-z-]+\\s+){0,2}(?:${[...LINKEDIN_EMPLOYMENT_TYPES, ...SUFFIX_ONLY_EMPLOYMENT_TYPES].join("|")}))\\s*$`,
	"i",
);

export const JUNK_COMPANY_NAME_PATTERN =
	"^(full|part)[- ]?time|^(contract|freelance|self[- ]?employed|internship|permanent|undefined|unknown)\\y|\\d+\\s*(yrs?|mos?)\\y";

const GARBAGE_COMPANY_NAME = new RegExp(JUNK_COMPANY_NAME_PATTERN.replaceAll("\\y", "\\b"), "i");

export function isGarbageCompanyName(name: string): boolean {
	return GARBAGE_COMPANY_NAME.test(name);
}

const PLACEHOLDER_LINKEDIN_COMPANY_NAMES_BY_ID: Readonly<Record<number, string>> = {
	18583501: "Stealth Startup",
	96670793: "Stealth AI Startup",
	91313799: "Stealth",
	79372457: "Stealth",
	18016269: "Stealth Mode",
	19158273: "Confidential ( Stealth Mode )",
};

export const PLACEHOLDER_LINKEDIN_COMPANY_IDS: ReadonlySet<number> = new Set(
	Object.keys(PLACEHOLDER_LINKEDIN_COMPANY_NAMES_BY_ID).map(Number),
);

export function isPlaceholderLinkedinCompany(linkedinId: number | null | undefined): boolean {
	return linkedinId != null && PLACEHOLDER_LINKEDIN_COMPANY_IDS.has(linkedinId);
}

const PLACEHOLDER_COMPANY_NAME =
	/^(\[?not[_ ]found\]?|company not found|n\/?a|none( at this time)?\.?|unknown|tbd|unemployed\b.*|(currently )?looking\b.*|open to (work|opportunities).*|no-company\..*)$/i;

export function cleanLinkedinCompanyName(raw: string | null | undefined): string | null {
	if (!raw) return null;
	const name = raw
		.replace(/\s*·.*$/, "")
		.replace(EMPLOYMENT_TYPE_SUFFIX, "")
		.replace(/\s*[.,]\s*undefined\b.*$/i, "")
		.trim();
	if (name.length < 2) return null;
	if (name.toLowerCase().startsWith("undefined")) return null;
	if (PLACEHOLDER_COMPANY_NAME.test(name)) return null;
	if (LINKEDIN_EMPLOYMENT_TYPES.has(name.toLowerCase())) return null;
	if (DURATION_ONLY_NAME.test(name)) return null;
	return name;
}

const SELF_EMPLOYMENT_AS_COMPANY = new Set(["freelance", "self-employed"]);

export function extractEmploymentType(raw: string | null | undefined): string | null {
	if (!raw) return null;
	for (const segment of raw.split(/[·.]/)) {
		const key = segment.trim().toLowerCase();
		if (LINKEDIN_EMPLOYMENT_TYPES.has(key)) return normalizeEmploymentType(key);
	}
	const qualifiedSuffix = raw.match(EMPLOYMENT_TYPE_SUFFIX)?.[1];
	return qualifiedSuffix ? normalizeEmploymentType(qualifiedSuffix) : null;
}

export function splitCompanyEmploymentType(raw: string | null | undefined): {
	companyName: string | null;
	employmentType: string | null;
} {
	const employmentType = extractEmploymentType(raw);
	let companyName = cleanLinkedinCompanyName(raw);
	if (!companyName && employmentType && SELF_EMPLOYMENT_AS_COMPANY.has(employmentType.toLowerCase())) {
		companyName = employmentType;
	}
	return { companyName, employmentType };
}

const EMPLOYER_SEPARATOR = /\s+at\s+|\s*[@·|(]/i;

export function stripEmployerFromTitle(raw: string | null | undefined): string | null {
	if (!raw) return null;
	const role = raw.split(EMPLOYER_SEPARATOR)[0]?.trim() ?? "";
	return role.length >= 2 ? role : null;
}

export function sanitizeCompanyName(raw: string | null | undefined): string {
	const cleaned = cleanLinkedinCompanyName(raw);
	if (!cleaned) return "";
	const name = cleanCompanyName(cleaned);
	if (isGarbageCompanyName(name)) return "";
	return name;
}

export function companyNameLookupVariants(name: string): {
	normalized: string;
	noParens: string;
	alphanumeric: string;
} {
	const normalized = name.toLowerCase().trim();
	return {
		normalized,
		noParens: normalized
			.replace(/\s*\([^)]*\)\s*/g, " ")
			.replace(/\s+/g, " ")
			.trim(),
		alphanumeric: normalized.replace(/[^a-z0-9]/g, ""),
	};
}

const NON_EMPLOYMENT_COMPANY =
	/\b(alumni|club|society|fraternity|sorority|student\s+(association|government|union)|hackathon)\b/i;
const NON_EMPLOYMENT_TITLE = /\b(volunteer|ambassador|alumni|board\s+member|club\s+(president|member))\b|^member$/i;
const SCHOOL_EMPLOYER = /\b(university|college|high school|school of|academy)\b/i;
const PROFESSIONAL_TITLE =
	/\b(engineer|developer|scientist|researcher|research|fellow|professor|postdoc|faculty|director|manager|architect|lead)\b/i;

export function isNonEmploymentExperience(title: string | null, company: string | null): boolean {
	const roleTitle = title ?? "";
	const employer = company ?? "";
	if (NON_EMPLOYMENT_COMPANY.test(employer)) return true;
	if (NON_EMPLOYMENT_TITLE.test(roleTitle.trim())) return true;
	if (SCHOOL_EMPLOYER.test(employer) && !PROFESSIONAL_TITLE.test(roleTitle)) return true;
	return false;
}

export function normalizeUrlForComparison(url: string | null | undefined): string | null {
	if (!url) return null;
	return url
		.toLowerCase()
		.trim()
		.replace(/^https?:\/\//, "")
		.replace(/^www\./, "")
		.replace(/\/+$/, "");
}
