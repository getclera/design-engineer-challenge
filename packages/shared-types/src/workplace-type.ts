export const WORKPLACE_TYPES = ["remote", "hybrid", "on-site", "on-site or remote"] as const;
export type WorkplaceType = (typeof WORKPLACE_TYPES)[number];

export enum WORKPLACE_TYPE {
	REMOTE = "remote",
	HYBRID = "hybrid",
	ON_SITE = "on-site",
	ON_SITE_OR_REMOTE = "on-site or remote",
}

export const WORKPLACE_TYPE_LABELS: Record<WorkplaceType, string> = {
	remote: "Remote",
	hybrid: "Hybrid",
	"on-site": "On-site",
	"on-site or remote": "On-site or Remote",
};

export function workplaceTypeLabel(value: string): string {
	const canonical = normalizeWorkplaceType(value);
	return canonical ? WORKPLACE_TYPE_LABELS[canonical] : value;
}

const ALIASES: Record<string, WorkplaceType> = {
	onsite: "on-site",
	inoffice: "on-site",
	inperson: "on-site",
	office: "on-site",
	officebased: "on-site",
	presencial: "on-site",
	onsiteorremote: "on-site or remote",
	remoteoronsite: "on-site or remote",
	onpremise: "on-site",
	onpremises: "on-site",
	workfromhome: "remote",
	wfh: "remote",
	remotefirst: "remote",
	fullyremote: "remote",
	fullremote: "remote",
	"100remote": "remote",
};

export function toEnumSlug(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[\s_]+/g, "-");
}

export function canonicaliseWorkplaceType(value: unknown): unknown {
	if (typeof value !== "string") return value;
	const slug = toEnumSlug(value);
	return ALIASES[slug.replaceAll("-", "")] ?? slug;
}

function isWorkplaceType(value: unknown): value is WorkplaceType {
	return typeof value === "string" && (WORKPLACE_TYPES as readonly string[]).includes(value);
}

export function normalizeWorkplaceType(value: string | null | undefined): WorkplaceType | null {
	const canonical = canonicaliseWorkplaceType(value);
	return isWorkplaceType(canonical) ? canonical : null;
}

export function normalizeWorkplaceTypes(values: unknown): WorkplaceType[] {
	if (!Array.isArray(values)) return [];
	const normalized = values.map((value) => normalizeWorkplaceType(typeof value === "string" ? value : null));
	return Array.from(new Set(normalized.filter((value): value is WorkplaceType => value !== null)));
}

const JOB_WORKPLACE_TYPES_BY_PREFERENCE: Record<WorkplaceType, readonly WorkplaceType[]> = {
	[WORKPLACE_TYPE.HYBRID]: [WORKPLACE_TYPE.HYBRID, WORKPLACE_TYPE.REMOTE, WORKPLACE_TYPE.ON_SITE_OR_REMOTE],
	[WORKPLACE_TYPE.ON_SITE]: [WORKPLACE_TYPE.ON_SITE_OR_REMOTE, WORKPLACE_TYPE.ON_SITE, WORKPLACE_TYPE.HYBRID],
	[WORKPLACE_TYPE.REMOTE]: [WORKPLACE_TYPE.REMOTE, WORKPLACE_TYPE.ON_SITE_OR_REMOTE],
	[WORKPLACE_TYPE.ON_SITE_OR_REMOTE]: [
		WORKPLACE_TYPE.ON_SITE_OR_REMOTE,
		WORKPLACE_TYPE.REMOTE,
		WORKPLACE_TYPE.ON_SITE,
		WORKPLACE_TYPE.HYBRID,
	],
};

export function jobWorkplaceTypesForPreferences(workPreferences: readonly string[]): WorkplaceType[] {
	const types = normalizeWorkplaceTypes([...workPreferences]).flatMap(
		(preference) => JOB_WORKPLACE_TYPES_BY_PREFERENCE[preference],
	);
	return Array.from(new Set(types));
}

const CITY_LIST = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

export function formatWorkplaceLocation(
	workplaceType?: string | null,
	cities?: readonly (string | null | undefined)[] | null,
): string | null {
	const places = [...new Set((cities ?? []).map((c) => c?.trim()).filter((c): c is string => Boolean(c)))];
	const mode = workplaceType?.trim() || null;
	const place = places.length > 0 ? CITY_LIST.format(places) : null;
	if (!mode) return place;

	const label = workplaceTypeLabel(mode);
	if (!place) return label;
	if (normalizeWorkplaceType(mode) === "remote") return `Remote (based in ${place})`;
	return `${label} in ${place}`;
}
