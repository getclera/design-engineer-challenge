import { cleanName } from "./clean-name.ts";

const INITIALS_SKIP_SUFFIXES = new Set(["II", "III", "IV", "JR", "SR"]);

export function getInitials(name: string): string {
	const parts = (name ?? "")
		.split(/[\s.]+/)
		.map((part) => part.replace(/[^\p{L}\p{N}]/gu, ""))
		.filter(Boolean);
	if (parts.length === 0) return "";
	while (parts.length > 1 && INITIALS_SKIP_SUFFIXES.has(parts[parts.length - 1].toUpperCase())) {
		parts.pop();
	}
	const first = parts[0][0] ?? "";
	const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
	return (first + last).toUpperCase();
}

const ROMAN_NUMERAL_SUFFIXES = new Set(["II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]);

const CREDENTIAL_ABBREVIATIONS = new Set([
	"PHD",
	"MD",
	"MS",
	"MSC",
	"MA",
	"MBA",
	"BA",
	"BS",
	"BSC",
	"BBA",
	"JD",
	"LLM",
	"LLB",
	"EDD",
	"DDS",
	"DPT",
	"DVM",
	"MHA",
	"MPH",
	"MENG",
	"MFA",
	"DSC",
	"DBA",
	"CPA",
	"CFA",
	"CSM",
	"CSPO",
	"PMP",
	"PE",
	"RN",
	"LPN",
	"NP",
	"MFT",
	"LCSW",
	"OTR",
	"PT",
	"CMA",
	"CMT",
	"SHRM",
	"SPHR",
	"PHR",
	"MCSE",
	"AWS",
	"GCP",
	"ITIL",
	"CISSP",
	"CCNA",
	"CCNP",
	"SSGB",
	"SSBB",
	"SFC",
	"ESQ",
	"FACS",
	"FACP",
	"FRCS",
	"FAIA",
	"AIA",
	"PLA",
	"LEED",
	"CISA",
	"CISM",
	"OSCP",
	"GIAC",
	"SCRUM",
	"MCITP",
	"MCP",
	"MCSA",
	"MCT",
	"RHCE",
	"RHCSA",
	"TM",
]);

function isCredentialSegment(segment: string): boolean {
	const cleaned = segment.replace(/[()&]/g, " ").trim();
	if (cleaned === "") return false;
	const tokens = cleaned.split(/[\s-]+/).filter(Boolean);
	if (tokens.length === 0) return false;
	for (const token of tokens) {
		const noDots = token.replace(/\./g, "");
		if (noDots === "") continue;
		if (CREDENTIAL_ABBREVIATIONS.has(noDots.toUpperCase())) continue;
		if (noDots.length >= 2 && noDots.length <= 5 && /^[A-Z]+$/.test(noDots)) continue;
		return false;
	}
	return true;
}

function isLastFirstAllCapsFormat(parts: string[]): boolean {
	if (parts.length !== 2) return false;
	const [first, last] = parts;
	const firstTokens = first.trim().split(/\s+/).filter(Boolean);
	const lastTokens = last.trim().split(/\s+/).filter(Boolean);
	if (firstTokens.length !== 1 || lastTokens.length !== 1) return false;
	const firstNoDots = firstTokens[0].replace(/\./g, "");
	const lastNoDots = lastTokens[0].replace(/\./g, "");
	const looksLikeAllCapsName = (t: string) =>
		t.length >= 2 && /^[A-Z]+$/.test(t) && !CREDENTIAL_ABBREVIATIONS.has(t.toUpperCase());
	return looksLikeAllCapsName(firstNoDots) && looksLikeAllCapsName(lastNoDots);
}

export function stripCredentialSuffixes(name: string): string;
export function stripCredentialSuffixes(name: null): null;
export function stripCredentialSuffixes(name: undefined): undefined;
export function stripCredentialSuffixes(name: string | null | undefined): string | null | undefined;
export function stripCredentialSuffixes(name: string | null | undefined): string | null | undefined {
	if (name == null) return name;
	if (name.trim() === "") return name;
	const parts = name.split(",").map((p) => p.trim());
	if (isLastFirstAllCapsFormat(parts)) return name;
	let stripped = false;
	while (parts.length > 1 && isCredentialSegment(parts[parts.length - 1])) {
		parts.pop();
		stripped = true;
	}
	if (!stripped) return name;
	return parts.join(", ");
}

function isTwoLetterAllCaps(token: string): boolean {
	const letters = token.replace(/[^\p{L}]/gu, "");
	return letters.length === 2 && !/\p{Ll}/u.test(letters);
}

export function titleCasePersonName(name: string): string;
export function titleCasePersonName(name: null): null;
export function titleCasePersonName(name: undefined): undefined;
export function titleCasePersonName(name: string | null | undefined): string | null | undefined;
export function titleCasePersonName(name: string | null | undefined): string | null | undefined {
	if (name == null) return name;
	if (name.trim() === "") return name;

	return name
		.split(/(\s+)/)
		.map((token) => {
			if (token === "" || /^\s+$/.test(token)) return token;
			if (ROMAN_NUMERAL_SUFFIXES.has(token)) return token;
			if (isTwoLetterAllCaps(token)) return token;
			const hasUpper = /\p{Lu}/u.test(token);
			const hasLower = /\p{Ll}/u.test(token);
			const isUniformCase = (hasUpper && !hasLower) || (!hasUpper && hasLower);
			if (!isUniformCase) return token;
			return token.toLowerCase().replace(/(?<!\p{L})\p{L}/gu, (ch) => ch.toUpperCase());
		})
		.join("");
}

interface NameFields {
	first_name?: string | null;
	last_name?: string | null;
	firstname?: string | null;
	lastname?: string | null;
	firstName?: string | null;
	lastName?: string | null;
}

export function hasDisplayableName(nameObj: NameFields): boolean {
	return Boolean(
		nameObj.first_name ||
			nameObj.firstname ||
			nameObj.firstName ||
			nameObj.last_name ||
			nameObj.lastname ||
			nameObj.lastName,
	);
}

export function getFullName(nameObj: NameFields, fallback = "Unknown"): string {
	const firstName = nameObj.first_name || nameObj.firstname || nameObj.firstName;
	const lastName = nameObj.last_name || nameObj.lastname || nameObj.lastName;

	if (firstName && lastName) {
		return `${firstName} ${lastName}`;
	}

	const singleName = firstName || lastName;
	if (singleName) {
		return singleName;
	}

	return fallback;
}

export function splitFullName(fullName: string | null | undefined): { firstname: string; lastname?: string } {
	const cleaned = fullName ? cleanName(fullName) : null;
	if (!cleaned) return { firstname: "" };
	const parts = cleaned.split(/\s+/);
	const firstname = parts.shift() ?? "";
	return { firstname, lastname: parts.length ? parts.join(" ") : undefined };
}

export function getSignOffName(emailOrName: string): {
	signOffName: string;
	linkedinUrl: string;
} {
	const alexEmails = new Set(["a.farr", "alexander.farr", "alexander", "farr.a", "farr", "founder", "founders"]);
	const sebEmails = new Set([
		"sebastian.scott",
		"sebastian",
		"s.scott",
		"scott",
		"scott.j",
		"scott.s",
		"j.scott",
		"scott.sebastian",
	]);
	const talentEmails = new Set(["talent"]);
	const namePart = emailOrName.split("@")[0].trim().toLowerCase();
	const tokenizedNameParts = namePart.split(/[._+\-\s]+/).filter((part) => part.length > 0);
	const candidates = new Set([namePart, ...tokenizedNameParts]);
	if ([...candidates].some((candidate) => alexEmails.has(candidate))) {
		return { signOffName: "Alex", linkedinUrl: "https://www.linkedin.com/in/alex-farr/" };
	}
	if ([...candidates].some((candidate) => sebEmails.has(candidate))) {
		return { signOffName: "Seb", linkedinUrl: "https://www.linkedin.com/in/jsebastianscott/" };
	}
	if ([...candidates].some((candidate) => talentEmails.has(candidate))) {
		return { signOffName: "Clera", linkedinUrl: "https://www.linkedin.com/company/105863333/" };
	}
	const fallbackToken = tokenizedNameParts[0] ?? namePart;
	const properName = fallbackToken.charAt(0).toUpperCase() + fallbackToken.slice(1);
	return { signOffName: properName || "Clera", linkedinUrl: "https://www.linkedin.com/company/105863333/" };
}
