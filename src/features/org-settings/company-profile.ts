/** What candidates see about the company: the Company tab of Settings, and the card that previews it. */
export interface CompanyProfile {
	name: string;
	logo: string | null;
	/** "Description": the one line under the name. */
	pitch: string;
	/** "Product description". */
	building: string;
	/** "About the team", optional. */
	team: string;
	reasons: [string, string, string];
	size: CompanySize | null;
	industry: string;
	stage: CompanyStage | null;
	funding: string;
	founded: string;
	mode: WorkMode | null;
	locations: string[];
	benefits: string[];
	culture: string[];
	stack: string[];
	teamImages: string[];
	productImages: string[];
	website: string;
	linkedin: string;
	jobs: string;
	rounds: FundingRound[];
}

export interface FundingRound {
	id: string;
	round: string;
	amount: string;
	date: string;
	investors: string;
	/** Found by our data providers, not typed in by the company. */
	auto: boolean;
}

export const COMPANY_SIZES = ["1–10", "11–50", "51–200", "200+"] as const;
export const COMPANY_STAGES = ["Seed", "Series A", "Series B", "Later"] as const;
export const WORK_MODES = ["On-site", "Hybrid", "Remote"] as const;
export type CompanySize = (typeof COMPANY_SIZES)[number];
export type CompanyStage = (typeof COMPANY_STAGES)[number];
export type WorkMode = (typeof WORK_MODES)[number];

export const PITCH_MAX = 90;
export const URL_FIELDS = ["website", "linkedin", "jobs"] as const;
export const TAG_FIELDS = ["locations", "benefits", "culture", "stack"] as const;
export const IMAGE_FIELDS = ["teamImages", "productImages"] as const;
export type TagField = (typeof TAG_FIELDS)[number];
export type ImageField = (typeof IMAGE_FIELDS)[number];

/** Loose on purpose: "tidewater.com" and "https://tidewater.com/jobs" both pass, "tidewater" doesn't. */
export const looksLikeUrl = (value: string) => /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(value.trim());

export const filledReasons = (profile: Pick<CompanyProfile, "reasons">) =>
	profile.reasons.filter((reason) => reason.trim()).length;

/** The sections of Settings › Company, with the original product's titles and lines. */
export const COMPANY_SECTIONS = [
	{ id: "logo", title: "Logo", description: "Shown on your company page and to candidates." },
	{ id: "basic", title: "Basic information", description: "Public-facing company name and summary." },
	{ id: "details", title: "Company details", description: "Used for matching and presentation." },
	{
		id: "selling",
		title: "Selling points",
		description:
			"Why a strong candidate would want to join you. These apply to every role, and each role can add its own on top.",
	},
	{
		id: "culture",
		title: "Culture & offering",
		description: "Shown on your company page. Type and press Enter to add.",
	},
	{ id: "images", title: "Team & product images", description: "Shown on your company page to candidates." },
	{ id: "links", title: "Links", description: "Where to find the company online." },
	{
		id: "funding",
		title: "Funding & investors",
		description:
			"Shown on your public company page. Auto-detected rounds come from our data providers. Remove anything that looks wrong, and add rounds we missed.",
	},
] as const;
export type SectionId = (typeof COMPANY_SECTIONS)[number]["id"];

type Field = keyof CompanyProfile;

/** Which section a field lives in: deep links (`?focus=linkedin`) open the right one. */
export const SECTION_OF: Record<Field, SectionId> = {
	logo: "logo",
	name: "basic",
	pitch: "basic",
	building: "basic",
	team: "basic",
	size: "details",
	industry: "details",
	founded: "details",
	stage: "details",
	funding: "details",
	mode: "details",
	reasons: "selling",
	benefits: "culture",
	culture: "culture",
	stack: "culture",
	locations: "culture",
	teamImages: "images",
	productImages: "images",
	website: "links",
	linkedin: "links",
	jobs: "links",
	rounds: "funding",
};

/** Required answers per section, as the labels the collapsed row shows ("Company size missing"). */
const REQUIRED: Record<SectionId, [Field, string][]> = {
	logo: [["logo", "Logo"]],
	basic: [
		["name", "Name"],
		["pitch", "Description"],
		["building", "Product description"],
	],
	details: [
		["size", "Company size"],
		["industry", "Industry"],
		["founded", "Founded year"],
		["stage", "Last funding round"],
	],
	selling: [["reasons", "Pitch bullets"]],
	culture: [
		["benefits", "Benefits"],
		["culture", "Culture"],
		["stack", "Tech stack"],
		["locations", "Office locations"],
	],
	images: [
		["teamImages", "Team images"],
		["productImages", "Product images"],
	],
	links: [
		["website", "Website"],
		["linkedin", "LinkedIn"],
	],
	funding: [["rounds", "A funding round"]],
};

function answered(profile: CompanyProfile, field: Field): boolean {
	if (field === "reasons") return filledReasons(profile) === 3;
	// A half-typed link doesn't count: Settings won't save it, so candidates wouldn't see it.
	if (field === "website" || field === "linkedin") return looksLikeUrl(profile[field]);
	const value = profile[field];
	return Array.isArray(value) ? value.length > 0 : !!String(value ?? "").trim();
}

export interface SectionState {
	missing: string[];
	/** Some of it answered: the dot shows half. */
	partial: boolean;
}

export function sectionState(profile: CompanyProfile, id: SectionId): SectionState {
	const required = REQUIRED[id];
	const missing = required
		.filter(([field]) => !answered(profile, field))
		.map(([field, label]) => {
			if (field !== "reasons") return label;
			const left = 3 - filledReasons(profile);
			return `${left} more pitch bullet${left === 1 ? "" : "s"}`;
		});
	const partial =
		missing.length > 0 && (missing.length < required.length || (id === "selling" && filledReasons(profile) > 0));
	return { missing, partial };
}

export interface CompanyGap {
	key: SectionId;
	/** Short, for Home's "Missing company details, links". */
	label: string;
}

/** Sections with something missing, in page order. Home, the Company tab count and the bar on top all read this. */
export function companyGaps(profile: CompanyProfile): CompanyGap[] {
	return COMPANY_SECTIONS.filter((s) => sectionState(profile, s.id).missing.length > 0).map((s) => ({
		key: s.id,
		label: s.title.toLowerCase(),
	}));
}

/** What reading a website finds. Reasons are a list: they go into whichever of the three slots are empty. */
export type WebsiteFindings = Partial<Omit<CompanyProfile, "reasons">> & { reasons?: string[] };

/**
 * "Fill from website": the answers only go into fields that are still empty, never over what someone wrote.
 * Returns the fields it would change, with their new values.
 */
export function fillEmpty(profile: CompanyProfile, found: WebsiteFindings): Partial<CompanyProfile> {
	const out: Partial<CompanyProfile> = {};
	for (const [key, value] of Object.entries(found) as [Field, unknown][]) {
		if (key === "reasons") {
			const next = [...profile.reasons] as CompanyProfile["reasons"];
			const extra = (value as string[]).filter((r) => !profile.reasons.includes(r));
			for (let i = 0; i < 3 && extra.length; i++) if (!next[i].trim()) next[i] = extra.shift() as string;
			if (next.some((r, i) => r !== profile.reasons[i])) out.reasons = next;
			continue;
		}
		const current = profile[key];
		const empty = Array.isArray(current) ? current.length === 0 : !String(current ?? "").trim();
		if (empty) Object.assign(out, { [key]: value });
	}
	return out;
}
