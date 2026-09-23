import { FALLBACK_TALENT_COUNT } from "@/config/constants";

export const JOBS_COUNT_LABEL = "2,000+";
export const COMPANIES_COUNT_LABEL = "900+";
export const REFERRAL_REWARD_LABEL = "$100";
export const COMPANY_REFERRAL_REWARD_LABEL = "$5,000";
export const RECRUITER_REFERRAL_REWARD_LABEL = "$5,000";
export const RECRUITER_REFERRAL_REWARD_SHORT_LABEL = "$5k";

const CANDIDATE_COUNT_STEP = 5000;

export function formatApproximateCount(count: number): string {
	const rounded = Math.floor(count / CANDIDATE_COUNT_STEP) * CANDIDATE_COUNT_STEP;
	return `${rounded.toLocaleString("en-US")}+`;
}

export const CANDIDATES_COUNT_LABEL = formatApproximateCount(FALLBACK_TALENT_COUNT);
