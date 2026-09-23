import type { CoreUserProfileWire } from "@app/api/_utils/talent-info-core-wire";
import type { ExperimentRating } from "./experimentRating";
import type { AIInteractionData, LinkItem, Skill } from "./profileData";

interface LinkedInExperience {
	companyId?: string;
	companyUrn?: string;
	companyLink1?: string;
	logo?: string;
	title: string;
	subtitle?: string;
	caption?: string;
	metadata?: string;
	breakdown: boolean;
	subComponents: {
		title?: string;
		caption?: string;
		metadata?: string;
		description: {
			type: string;
			text: string;
			thumbnail?: string;
		}[];
	}[];
}

interface LinkedInEducation {
	companyId?: string;
	companyUrn?: string;
	companyLink1?: string;
	logo?: string;
	title: string;
	subtitle?: string;
	breakdown: boolean;
	subComponents: {
		description: {
			type: string;
			text: string;
			thumbnail?: string;
		}[];
	}[];
}

interface LinkedInCertificate {
	title: string;
	subtitle?: string;
	caption?: string;
}

interface LinkedInHonorAward {
	title: string;
	subtitle?: string;
	caption?: string;
}

interface LinkedInLanguage {
	title: string;
	caption?: string;
	breakdown: boolean;
	subComponents: {
		description: {
			type: string;
			text: string;
			thumbnail?: string;
		}[];
	}[];
}

interface LinkedInVolunteerExperience {
	title: string;
	subtitle?: string;
	caption?: string;
}

interface LinkedInSkill {
	title: string;
	subComponents: {
		description?: {
			type: string;
			text: string;
			thumbnail?: string;
		}[];
	}[];
}

interface LinkedInInterest {
	section_name: string;
	section_components: {
		titleV2: string;
		caption: string;
		subtitle?: string;
		size: string;
		textActionTarget: string;
		subComponents: unknown[];
	}[];
}

interface LinkedInRecommendation {
	date?: string;
	timestamp?: string;
	text?: string;
	content?: string;
	image?: string;
	likes?: number;
	comments?: number;
}

interface LinkedInPublication {
	title?: string;
	subtitle?: string;
	subComponents?: {
		description?: {
			type: string;
			text: string;
			thumbnail?: string;
		}[];
	}[];
}

interface StartResponse {
	[key: string]: unknown;
}

export interface ProfileData {
	location?: string;
	[key: string]: unknown;
}

interface Opportunity {
	id: number;
	talentId: string;
	jobId: string | null;
	status: string | null;
	interestTalent: boolean | null;
	questionsCount: number;
	questionStatus: "No Questions" | "Answered" | "Partial" | "Pending";
	[key: string]: unknown;
}

export interface Candidate {
	aiData: AIInteractionData;
	id: string;
	nano_id: string;
	firstname?: string;
	lastname?: string;
	name?: string;
	email?: string;
	phone?: string;
	location?: string;
	status?: string;
	comment?: string | Record<string, unknown>;
	linkedin_url?: string;
	linkedin_data?: {
		firstName?: string;
		lastName?: string;
		fullName?: string;
		publicIdentifier?: string;
		headline?: string;
		connections?: number;
		followers?: number;
		profilePic?: string;
		backgroundPicture?: string;
		about?: string;
		experiences?: LinkedInExperience[];
		educations?: LinkedInEducation[];
		licenseAndCertificates?: LinkedInCertificate[];
		honorsAndAwards?: LinkedInHonorAward[];
		languages?: LinkedInLanguage[];
		volunteerAndAwards?: LinkedInVolunteerExperience[];
		skills?: LinkedInSkill[];
		interests?: LinkedInInterest[];
		recommendations?: LinkedInRecommendation[];
		publications?: LinkedInPublication[];
	} | null;
	cv_path?: string;
	avatar_url?: string;
	rating?: number;
	occupation?: string;
	created_at: string;
	last_status_changed_at?: string;
	last_status_changed_by?: string;
	cv_filename?: string;
	source?: string;
	start_response?: StartResponse;
	user_id?: string;
	ratings?: ExperimentRating[];
	fts_data?: string;
	updated_at?: string;
	experience?: LinkedInExperience[];
	education?: LinkedInEducation[];
	variant?: string[];
	recruiter_id?: string;
	opportunities?: Opportunity[];
	owner?: string;
	github_url?: string | null;
	portfolio_url?: string | null;
	other_links?: LinkItem[] | null;
	utm_parameter?: string;
	profileData?: ProfileData | null;
	roles?: string[];
	follow_up_needed?: boolean;
	follow_up_date?: string | null;
	follow_up_note?: string | null;
	role_specific?: string;
	userProfile?: CoreUserProfileWire | null;
	comments?: any[];
	skills?: LinkedInSkill[];
	talent_skills?: Skill[];
	preferred_job_comment?: string;
	years_experience?: number | null;
	linkedin_whitelist_status?: boolean;
	priority_star?: boolean;
	open_for_opportunities?: boolean;
	ai_generated_talent_summary?: string;
	talent_oneliner?: string;
	bundledRoles?: Array<{ id: number; name: string }>;
	bundledTags?: Array<{ id: number; tag: string; category: string }>;
	elo_score?: number | null;
	opportunityCount?: number;
}

export interface FullCandidate extends Candidate {
	ratings: ExperimentRating[];
}
