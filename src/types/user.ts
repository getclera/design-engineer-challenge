import type { AppRole } from "@clera/db/types";
import type { WorkplaceType } from "@clera/shared-types";
import type { ResumeAnalysis } from "./aiInteraction";

export type { AppRole };

export type SidebarMode = "hidden" | "minimal" | "full";

export const SIDEBAR_MODES: readonly SidebarMode[] = ["hidden", "minimal", "full"] as const;

export function isSidebarMode(value: unknown): value is SidebarMode {
	return typeof value === "string" && (SIDEBAR_MODES as readonly string[]).includes(value);
}

export function resolveSidebarMode(rawMode: unknown): SidebarMode {
	return isSidebarMode(rawMode) ? rawMode : "full";
}

export const APP_ROLES = {
	ADMIN: "admin",
	MEMBER: "member",
	TALENT: "talent",
	RECRUITER: "recruiter",
	ONBOARDING: "onboarding",
} as const satisfies Record<string, AppRole>;

const APP_ROLE_VALUES: readonly string[] = Object.values(APP_ROLES);

export function isAppRole(value: unknown): value is AppRole {
	return typeof value === "string" && APP_ROLE_VALUES.includes(value);
}

export interface Profile {
	id: string;
	user_id: string;
	first_name: string | null;
	last_name: string | null;
	email: string | null;
	avatar_url: string | null;
	phone: string | null;
	location: string | null;
	normalized_location: string | null;
	latitude: number | null;
	longitude: number | null;
	linkedin_url: string | null;
	portfolio_url: string | null;
	github_url: string | null;
	cv_file_path: string | null;
	cv_analysis: ResumeAnalysis | null;
	available_start_date: string | null;
	salary_lower_bound: number | null;
	payout_currency: string | null;
	role: AppRole;
	subscription: boolean | null;
	source: string | null;
	utm: string | null;
	roles: string[];
	willingness_to_relocate: ("No" | "Within my country" | "Within my continent" | "Everywhere")[];
	job_types: ("Full-Time" | "Part-time" | "Internship" | "Freelance")[];
	preferred_work_environment: WorkplaceType[];
	other_links: string[];
	jobs_interest: string[];
	updated_at: string;
	job_recommendations: string | null;
	referral_counter?: string | null;
	years_experience?: number | null;
	show_hotkey_tooltips: boolean;
	notify_pending_reviews: boolean;
	sidebar_mode: SidebarMode;
	is_active?: boolean;

	open_for_opportunities: boolean | null;
}
