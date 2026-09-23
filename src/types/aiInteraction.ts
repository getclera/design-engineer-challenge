export type AIInteractionStatus =
	| "new"
	| "welcome"
	| "sent_opportunities"
	| "no_opps"
	| "reacted_to_opps"
	| "moved_to_process"
	| "submittable"
	| "in_process"
	| "waiting"
	| "find_new_roles"
	| "backlog"
	| "unfit"
	| "blacklisted"
	| "hired"
	| "requesting_information"
	| "signup"
	| "linkedin"
	| "call"
	| "call_ended"
	| "submitted"
	| "screened"
	| "referred"
	| "double"
	| "personal"
	| "interview_taken"
	| "active"
	| "completed";

export interface AIInteraction {
	id: string;
	user_id: string;
	linkedin_url: string;
	status?: AIInteractionStatus | null;
	cv_path?: string | null;
	cv_feedback_status?: "pending" | "completed" | null;
	occupation?: string | null;
	rating?: number | null;
	[key: string]: unknown;
}

export interface ResumeAnalysis {
	overallScore: number;
	strengths: string[];
	improvementAreas: {
		issue: string;
		suggestion: string;
	}[];
	wordingSuggestions: {
		original: string;
		improved: string;
	}[];
	atsOptimization: {
		score: number;
		suggestions: string[];
	};
	summary: string;
}
