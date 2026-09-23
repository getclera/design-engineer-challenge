export const OrgDashboardEvents = {
	HOME_VIEWED: "org_home_viewed",
	REVIEW_VIEWED: "org_review_viewed",
	TALENT_SEARCH_VIEWED: "org_talent_search_viewed",
	TALENT_SEARCH_INTRO_REQUESTED: "org_talent_search_intro_requested",
	EXTERNAL_SEARCH_VIEWED: "org_external_search_viewed",
	EXTERNAL_SEARCH_RUN: "org_external_search_run",
	EXTERNAL_SEARCH_REOPENED: "org_external_search_reopened",
	EXTERNAL_CONTACT_LOOKUP_REQUESTED: "org_external_contact_lookup_requested",
	PIPELINE_VIEWED: "org_pipeline_viewed",
	MEMBERS_VIEWED: "org_members_viewed",
	ROLES_VIEWED: "org_roles_viewed",
	SEARCHES_VIEWED: "org_searches_viewed",
	SEARCH_DETAIL_VIEWED: "org_search_detail_viewed",
	SETTINGS_VIEWED: "org_settings_viewed",
	INTEGRATIONS_VIEWED: "org_integrations_viewed",
	ATS_INTEGRATION_REQUESTED: "org_ats_integration_requested",

	ROLE_EDIT_VIEWED: "org_role_edit_viewed",

	HANDPICKED_DROP_OPENED: "org_handpicked_drop_opened",
	HANDPICKED_TALENT_OPENED: "org_handpicked_talent_opened",
	SLACK_CHANNEL_CLICKED: "org_slack_channel_clicked",
	RECENT_SEARCH_OPENED: "org_recent_search_opened",
	INBOUND_INTRO_OPENED: "org_inbound_intro_opened",
	STAT_DRILLDOWN_CLICKED: "org_stat_drilldown_clicked",

	TALENT_PROFILE_VIEWED: "org_talent_profile_viewed",
	TALENT_LINKEDIN_CLICKED: "org_talent_linkedin_clicked",

	CANDIDATE_ACTION_INTRO_MODAL_OPENED: "org_dashboard_intro_modal_opened",
	CANDIDATE_ACTION_INTRO_REQUESTED: "org_dashboard_intro_requested",
	CANDIDATE_ACTION_PASS_MODAL_OPENED: "org_dashboard_pass_modal_opened",
	CANDIDATE_ACTION_PASSED: "org_dashboard_passed",

	SIMILAR_PICKS_SHOWN: "org_dashboard_similar_picks_shown",
	SIMILAR_PICK_INTRO_REQUESTED: "org_dashboard_similar_pick_intro_requested",
	SIMILAR_PICK_PASSED: "org_dashboard_similar_pick_passed",

	INTRO_PROMPT_DISMISSED: "org_intro_prompt_dismissed",

	FEEDBACK_SUBMITTED: "org_feedback_submitted",

	ATS_CONNECT_STARTED: "org_ats_connect_started",
	ATS_CONNECTED: "org_ats_connected",
	ATS_CONNECT_FAILED: "org_ats_connect_failed",
	ATS_DISCONNECTED: "org_ats_disconnected",
	ATS_ROLES_SYNC_STARTED: "org_ats_roles_sync_started",
	ATS_ROLES_SYNCED: "org_ats_roles_synced",
	ATS_ROLE_PICKER_OPENED: "org_ats_role_picker_opened",

	HM_LINK_WARNING_SHOWN: "org_hm_link_warning_shown",
	HM_LINK_WARNING_CONTINUED: "org_hm_link_warning_continued",
	HM_LINK_WARNING_SETUP_CLICKED: "org_hm_link_warning_setup_clicked",
	HM_LINK_WARNING_DISMISSED: "org_hm_link_warning_dismissed",
	ROLE_HM_WARNING_SHOWN: "org_role_hm_warning_shown",
	ROLE_HM_WARNING_LINK_CLICKED: "org_role_hm_warning_link_clicked",
	CONTACT_FORM_LINK_WARNING_SHOWN: "org_contact_form_link_warning_shown",
} as const;

export type OrgDashboardEventName = (typeof OrgDashboardEvents)[keyof typeof OrgDashboardEvents];

export type OrgSettingsSubview = "profile" | "company" | "workspace" | "root";
