export interface ResumeInfo {
	id: string;
	talent_id: string;
	document_url?: string | null;
	document_size?: number | null;
	document_type?: string | null;
	parsed_at?: string | null;
	processing_status?: string | null;
	processing_error?: string | null;
	has_cv: boolean;
	has_parsed_content: boolean;
	is_primary?: boolean;
	display_name?: string | null;
	source?: string | null;
	created_at?: string;
}

export interface ResumeDataResponse {
	success: boolean;
	cv: ResumeInfo;
	structured_data?: {
		meta_info: unknown | null;
		education: unknown[];
		skills: unknown[];
		certifications: unknown[];
		employment_history: unknown | null;
		languages: unknown[];
	} | null;
	parsing: {
		parse_triggered: boolean;
		parse_error: string | null;
	};
	error?: string;
}

export interface ResumeListItem {
	id: string;
	talent_id: string;
	display_name: string | null;
	is_primary: boolean;
	source: string | null;
	document_url: string | null;
	has_parsed_content: boolean;
	created_at: string;
}

export interface ResumeListResponse {
	success: boolean;
	resumes: ResumeListItem[];
	count: number;
	error?: string;
}

export interface EMPTY_STRUCTURED_DATA_TYPE {
	meta_info: null;
	education: never[];
	skills: never[];
	certifications: never[];
	employment_history: null;
	languages: never[];
}
