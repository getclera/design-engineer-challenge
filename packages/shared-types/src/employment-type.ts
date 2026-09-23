export const EMPLOYMENT_TYPES = [
	"Full-time",
	"Part-time",
	"Self-employed",
	"Freelance",
	"Contract",
	"Internship",
	"Apprenticeship",
	"Seasonal",
	"Temporary",
	"Permanent",
	"Work Study",
] as const;

export type EmploymentBaseType = (typeof EMPLOYMENT_TYPES)[number];

export const EMPLOYMENT_QUALIFIERS = ["Permanent", "Contract", "Temporary", "Seasonal", "Casual"] as const;

export type EmploymentQualifier = (typeof EMPLOYMENT_QUALIFIERS)[number];

export type EmploymentType = EmploymentBaseType | `${EmploymentQualifier} ${EmploymentBaseType}`;

const BASE_BY_KEY: Record<string, EmploymentBaseType> = Object.fromEntries(
	EMPLOYMENT_TYPES.map((t) => [t.toLowerCase(), t]),
);
const QUALIFIER_BY_KEY: Record<string, EmploymentQualifier> = Object.fromEntries(
	EMPLOYMENT_QUALIFIERS.map((q) => [q.toLowerCase(), q]),
);

const BASE_SCAN: EmploymentBaseType[] = [
	"Full-time",
	"Part-time",
	"Internship",
	"Apprenticeship",
	"Freelance",
	"Self-employed",
	"Contract",
	"Seasonal",
	"Temporary",
	"Permanent",
	"Work Study",
];

function matchBase(key: string): EmploymentBaseType | null {
	if (key in BASE_BY_KEY) return BASE_BY_KEY[key];
	for (const base of BASE_SCAN) {
		if (new RegExp(`\\b${base.toLowerCase().replace(/[\s-]/g, "[\\s-]")}\\b`).test(key)) return base;
	}
	return null;
}

export function normalizeEmploymentType(value: string | null | undefined): EmploymentType | null {
	if (!value) return null;
	const lower = value.trim().toLowerCase().replace(/\s+/g, " ");

	let qualifier: EmploymentQualifier | null = null;
	let rest = lower;
	const firstSpace = lower.indexOf(" ");
	if (firstSpace > 0) {
		const head = lower.slice(0, firstSpace);
		if (head in QUALIFIER_BY_KEY) {
			qualifier = QUALIFIER_BY_KEY[head];
			rest = lower.slice(firstSpace + 1);
		}
	}

	const base = matchBase(rest.replace(/\s+/g, "-").replace(/-+/g, "-"));
	if (!base) return null;
	return qualifier ? `${qualifier} ${base}` : base;
}
