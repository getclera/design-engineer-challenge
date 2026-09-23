const COMMON_TITLES = [
	"PhD",
	"Ph.D.",
	"Dr",
	"Dr.",
	"Professor",
	"Prof",
	"Prof.",
	"Mr",
	"Mr.",
	"Mrs",
	"Mrs.",
	"Ms",
	"Ms.",
	"Jr",
	"Jr.",
	"Sr",
	"Sr.",
	"III",
	"II",
	"IV",
	"MSE",
	"CISSP",
	"GCTI",
	"P.E",
	"MOT",
	"OTRL",
	"MSc",
	"BSc",
	"BA",
	"Scrum master",
	"Scrum Master",
	"scrum master",
	"Esq",
	"Esq.",
];

const EMOJI_BASE = String.raw`(?:\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}])`;
const EMOJI_TRAIL = String.raw`[\u{1F3FB}-\u{1F3FF}\u{FE0F}\u{20E3}]`;
const EMOJI_REGEX = new RegExp(`${EMOJI_BASE}(?:${EMOJI_TRAIL}|\\u{200D}${EMOJI_BASE}${EMOJI_TRAIL}?)*`, "gu");

const QUOTE_CHARS = `"'‘’“”`;
const QUOTED_ALIAS = new RegExp(`(^|\\s)[${QUOTE_CHARS}][^${QUOTE_CHARS}]+[${QUOTE_CHARS}](?=\\s|$)`, "g");
const PAREN_ALIAS = /\(([^)]+)\)/g;
const WRAPPING_QUOTES = new RegExp(`^\\s*[${QUOTE_CHARS}]\\s*|\\s*[${QUOTE_CHARS}]\\s*$`, "g");
const NAME_CHARS = /(?!\u{200C}|\u{200D})[^\p{L}\p{M}\p{N}\s.,'-]/gu;

export function stripEmoji(value: string | null | undefined): string | null {
	if (!value) return null;
	return value.replace(EMOJI_REGEX, "").replace(/\s+/g, " ").trim() || null;
}

function toProperCase(str: string): string {
	const acronyms = [
		"MBA",
		"MS",
		"BS",
		"BA",
		"MA",
		"PhD",
		"MD",
		"JD",
		"CPA",
		"PMP",
		"CISSP",
		"GCTI",
		"MSE",
		"MSc",
		"BSc",
		"OTRL",
		"P.E",
	];

	const parts = str.split(/([,\s]+)/);

	return parts
		.map((part) => {
			if (/^[,\s]+$/.test(part)) {
				return part;
			}

			const upperPart = part.toUpperCase();
			if (acronyms.includes(upperPart)) {
				return upperPart;
			}

			return part.toLowerCase().replace(/(^|[^\p{L}\p{N}_])(\p{L})/gu, (_m, sep, letter) => sep + letter.toUpperCase());
		})
		.join("");
}

function isAllUppercase(str: string): boolean {
	return str === str.toUpperCase() && /[A-Z]/.test(str);
}

export function cleanName(name: string): string | null {
	if (!name || typeof name !== "string") {
		return null;
	}

	const withoutEmoji = name.replace(EMOJI_REGEX, "");
	const withoutAliases = withoutEmoji.replace(PAREN_ALIAS, "").replace(QUOTED_ALIAS, "");
	const base = withoutAliases.trim() ? withoutAliases : withoutEmoji.replace(WRAPPING_QUOTES, "");

	let cleaned = base.replace(NAME_CHARS, "").replace(/\s+/g, " ").trim();

	if (!cleaned) {
		return null;
	}

	const sortedTitles = [...COMMON_TITLES].sort((a, b) => b.length - a.length);

	for (const title of sortedTitles) {
		const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

		const titleRegexStart = new RegExp(`^${escapedTitle}\\.?\\s+`, "i");
		cleaned = cleaned.replace(titleRegexStart, "");

		const titleRegexStartComma = new RegExp(`^${escapedTitle}\\.?\\s*,`, "i");
		cleaned = cleaned.replace(titleRegexStartComma, "");

		const titleRegexEnd = new RegExp(`,\\s*${escapedTitle}\\.?$`, "i");
		cleaned = cleaned.replace(titleRegexEnd, "");

		const titleRegexEndNoComma = new RegExp(`\\s+${escapedTitle}\\.?$`, "i");
		cleaned = cleaned.replace(titleRegexEndNoComma, "");

		if (title === "Ms" || title === "Mr" || title === "Mrs" || title === "Dr") {
			const titleRegexMiddle = new RegExp(`\\s+\\b${escapedTitle}\\b\\.?\\s+`, "i");
			cleaned = cleaned.replace(titleRegexMiddle, " ");
		} else {
			const titleRegexMiddle = new RegExp(`\\s+\\b${escapedTitle}\\b\\.?\\s*,`, "i");
			cleaned = cleaned.replace(titleRegexMiddle, ",");
		}
	}

	cleaned = cleaned
		.replace(/,\s*,+/g, ",")
		.replace(/,\s*$/, "")
		.replace(/\.\s*$/, "")
		.replace(/,\s*$/, "")
		.replace(/\s+/g, " ")
		.trim();

	if (!cleaned || (cleaned.length < 2 && !/\p{L}/u.test(cleaned))) {
		return null;
	}

	const parts = cleaned.split(/[,\s]+/).filter((part) => part.length > 0);

	const allPartsAreTitles = parts.every((part) =>
		COMMON_TITLES.some(
			(title) => part.toLowerCase() === title.toLowerCase() || part.toLowerCase() === `${title.toLowerCase()}.`,
		),
	);

	if (allPartsAreTitles && parts.length > 0) {
		return null;
	}

	if (isAllUppercase(cleaned) || cleaned === cleaned.toLowerCase()) {
		cleaned = toProperCase(cleaned);
	}

	return cleaned || null;
}

export function cleanNameOrKeep<T extends string | null | undefined>(name: T): T | string {
	if (!name) return name;
	return cleanName(name) ?? name;
}

type AiInteractionNameFields = {
	firstname?: string | null;
	lastname?: string | null;
	fullname?: string | null;
};

export function withCleanNames<T extends AiInteractionNameFields>(fields: T): T {
	return {
		...fields,
		...(fields.firstname ? { firstname: cleanNameOrKeep(fields.firstname) } : {}),
		...(fields.lastname ? { lastname: cleanNameOrKeep(fields.lastname) } : {}),
		...(fields.fullname ? { fullname: cleanNameOrKeep(fields.fullname) } : {}),
	};
}
