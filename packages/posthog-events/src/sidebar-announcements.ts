export const SidebarAnnouncementEvents = {
	VIEWED: "sidebar_announcement_viewed",
	CTA_CLICKED: "sidebar_announcement_cta_clicked",
	DISMISSED: "sidebar_announcement_dismissed",
} as const;

export type SidebarAnnouncementEventName = (typeof SidebarAnnouncementEvents)[keyof typeof SidebarAnnouncementEvents];

export type SidebarAnnouncementSurface = "org" | "talent";
