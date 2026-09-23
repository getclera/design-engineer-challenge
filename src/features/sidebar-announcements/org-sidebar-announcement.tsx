"use client";

import { ORG_ANNOUNCEMENTS, selectLiveAnnouncement } from "./catalog";
import { SidebarAnnouncementCard } from "./sidebar-announcement-card";

export function OrgSidebarAnnouncement({ orgId }: { orgId: string }) {
	const announcement = selectLiveAnnouncement(new Date(), ORG_ANNOUNCEMENTS);
	if (!announcement) return null;
	return (
		<SidebarAnnouncementCard announcement={announcement} href={announcement.href(orgId)} surface="org" orgId={orgId} />
	);
}

OrgSidebarAnnouncement.displayName = "OrgSidebarAnnouncement";
