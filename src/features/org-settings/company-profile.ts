/** What candidates see about the company: the Company tab of Settings, and the card that previews it. */
export interface CompanyProfile {
	name: string;
	logo: string | null;
	pitch: string;
	building: string;
	reasons: [string, string, string];
	size: CompanySize | null;
	stage: CompanyStage | null;
	funding: string;
	founded: string;
	mode: WorkMode | null;
	locations: string[];
	benefits: string[];
	culture: string[];
	stack: string[];
	website: string;
	linkedin: string;
	jobs: string;
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
export type TagField = (typeof TAG_FIELDS)[number];

/** Loose on purpose: "tidewater.com" and "https://tidewater.com/jobs" both pass, "tidewater" doesn't. */
export const looksLikeUrl = (value: string) => /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(value.trim());

export type GapKey = "size" | "reasons" | "linkedin";

export interface CompanyGap {
	key: GapKey;
	/** Short, for Home's "Missing company size, LinkedIn". */
	label: string;
	title: string;
	/** What it costs, in the candidate's terms. */
	why: string;
}

export const filledReasons = (profile: Pick<CompanyProfile, "reasons">) =>
	profile.reasons.filter((reason) => reason.trim()).length;

/** The three things that most change whether a candidate says yes, in the order Settings lists them. */
export function companyGaps(profile: CompanyProfile): CompanyGap[] {
	const gaps: CompanyGap[] = [];
	if (!profile.size)
		gaps.push({
			key: "size",
			label: "company size",
			title: "Company size",
			why: "We match people who want your stage.",
		});
	const missingReasons = 3 - filledReasons(profile);
	if (missingReasons > 0)
		gaps.push({
			key: "reasons",
			label: "reasons to join",
			title: `${missingReasons} more reason${missingReasons === 1 ? "" : "s"} to join`,
			why: "They open every intro we send.",
		});
	// A half-typed link doesn't count: Settings won't save it, so candidates wouldn't see it.
	if (!looksLikeUrl(profile.linkedin))
		gaps.push({
			key: "linkedin",
			label: "LinkedIn",
			title: "LinkedIn",
			why: "Most candidates check it before saying yes.",
		});
	return gaps;
}
