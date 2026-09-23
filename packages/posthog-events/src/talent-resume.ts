export const TalentResumeEvents = {
	RESUME_PAGE_VIEWED: "cv_page_viewed",
	RESUME_LOADING_COMPLETED: "cv_loading_completed",
	RESUME_UPLOAD_BUTTON_CLICKED: "cv_upload_button_clicked",
	RESUME_UPLOAD_STARTED: "cv_upload_started",
	RESUME_UPLOAD_COMPLETED: "cv_upload_completed",
	RESUME_UPLOAD_FAILED: "cv_upload_failed",
	RESUME_FEEDBACK_VIEWED: "cv_feedback_viewed",
	RESUME_FEEDBACK_MODAL_SHOWN: "cv_feedback_modal_shown",
	RESUME_FEEDBACK_SECTION_EXPANDED: "cv_feedback_section_expanded",
	RESUME_FEEDBACK_SECTION_COLLAPSED: "cv_feedback_section_collapsed",
	RESUME_REANALYZE_BUTTON_CLICKED: "cv_reanalyze_button_clicked",

	RESUME_ANALYSIS_STARTED: "resume_analysis_started",
	RESUME_ANALYSIS_COMPLETED: "resume_analysis_completed",
	RESUME_ANALYSIS_FAILED: "resume_analysis_failed",
	RESUME_REANALYSIS_REQUESTED: "resume_reanalysis_requested",
	RESUME_REVIEW_UPLOAD_STARTED: "resume_review_upload_started",
	RESUME_REVIEW_RESULTS_DISPLAYED: "resume_review_results_displayed",
	RESUME_REVIEW_ERROR: "resume_review_error",

	TEMPLATE_DOWNLOAD_STARTED: "clera_template_download_started",
	TEMPLATE_DOWNLOAD_COMPLETED: "clera_template_download_completed",
	TEMPLATE_DOWNLOAD_FAILED: "clera_template_download_failed",

	BUILDER_VIEWED: "resume_builder_viewed",
	BUILDER_BLOCKED_BY_BETA_GATE: "resume_builder_blocked_by_beta_gate",
	BUILDER_SEEDED: "resume_builder_seeded",
	BUILDER_PDF_GENERATED: "resume_builder_pdf_generated",
	BUILDER_SAVED_AS_RESUME: "resume_builder_saved_as_resume",
	BUILDER_COVER_LETTER_GENERATED: "resume_builder_cover_letter_generated",
	BUILDER_OUTREACH_DRAFTED: "resume_builder_outreach_drafted",
} as const;

export type TalentResumeEventName = (typeof TalentResumeEvents)[keyof typeof TalentResumeEvents];
