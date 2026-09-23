import { resumes } from "@/services/api";
import logger from "@/utils/logger";

export interface StructuredResumeData {
	meta_info: {
		professional_summary?: string;
		qualification_summary?: string;
		highest_degree_name?: string;
		highest_degree_normalized?: string;
		achievements?: string[];
		candidate_name?: string;
		formatted_name?: string;
		email_address?: string;
		telephone_normalized?: string;
		document_language?: string;
		contact_info_normalized?: {
			email?: string;
			phone?: string;
			webAddresses?: string[];
		};
		contact_info_raw?: {
			Location?: {
				Municipality?: string;
				Regions?: string[];
				PostalCode?: string;
				CountryCode?: string;
			};
		};
		[key: string]: unknown;
	} | null;
	education: Array<{
		id: string;
		school_name?: string;
		degree_name?: string;
		start_date?: string;
		end_date?: string;
		is_current?: boolean;
		education_majors?: Array<{ major: string }>;
		education_minors?: Array<{ minor: string }>;
		[key: string]: unknown;
	}>;
	skills: Array<{
		id: string;
		skill_name: string;
		skill_type?: string;
		normalized_skill?: string;
		months_experience?: number;
		last_used_date?: string;
		[key: string]: unknown;
	}>;
	employment_history: {
		id: string;
		months_of_work_experience?: number;
		months_of_management_experience?: number;
		positions?: Array<{
			id: string;
			employer_name?: string;
			job_title?: string;
			start_date?: string;
			end_date?: string;
			is_current?: boolean;
			description?: string;
			position_bullets?: Array<{
				id: string;
				bullet_text: string;
				bullet_type?: string;
				[key: string]: unknown;
			}>;
			[key: string]: unknown;
		}>;
		[key: string]: unknown;
	} | null;
	languages: Array<{
		id: string;
		language_name: string;
		language_code?: string;
		proficiency_level?: string;
		[key: string]: unknown;
	}>;
}

import type { ResumeDataResponse } from "@/services/api/resumes";

export type { ResumeDataResponse };

function ensureProperDocumentUrl(documentUrl: string | undefined): string | null {
	if (!documentUrl) return null;
	if (documentUrl.startsWith("http")) return documentUrl;
	logger.warn("Received raw storage path instead of signed URL", { documentUrl });
	return null;
}

export async function getResumeData(talentId: string, resumeId?: string): Promise<ResumeDataResponse> {
	try {
		logger.info(`Fetching resume data for talent ID: ${talentId}`, { resumeId });

		const result = await resumes.getData(talentId, resumeId);

		if (!result.ok) {
			logger.error("Error fetching resume data:", result.error);
			return {
				success: false,
				cv: {
					id: "",
					talent_id: talentId,
					has_cv: false,
					has_parsed_content: false,
				},
				parsing: { parse_triggered: false, parse_error: null },
				error: result.error.message,
				message: "Failed to fetch resume data",
			};
		}

		const response = result.data;

		if (response.cv?.document_url) {
			response.cv.document_url = ensureProperDocumentUrl(response.cv.document_url);
		}

		return response;
	} catch (error) {
		logger.error("Exception fetching resume data:", error);
		return {
			success: false,
			cv: {
				id: "",
				talent_id: talentId,
				has_cv: false,
				has_parsed_content: false,
			},
			parsing: { parse_triggered: false, parse_error: null },
			error: error instanceof Error ? error.message : String(error),
			message: "An unexpected error occurred",
		};
	}
}
