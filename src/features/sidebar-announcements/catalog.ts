import { externalRoutes, orgRoutes } from "@clera/route-factory";
import { ELO_FAST_TRACK_THRESHOLD } from "@clera/shared-types";
import { parseDate } from "@v2/utils/date";

export interface SidebarAnnouncement {
	id: string;
	label: string;
	body: string;
	ctaLabel: string;
	logoSrcs: readonly string[];
	publishedAt: string;
	expiresAt: string;
}

export interface OrgAnnouncement extends SidebarAnnouncement {
	href: (orgId: string) => string;
}

export interface TalentAnnouncement extends SidebarAnnouncement {
	href: string;
	external: boolean;
	minEloScore: number;
}

export const ORG_ANNOUNCEMENTS: readonly OrgAnnouncement[] = [
	{
		id: "clera-mcp-2026-09",
		label: "Clera MCP",
		body: "Search candidates and request intros from Claude, Cursor or ChatGPT. About a minute to set up.",
		ctaLabel: "Connect",
		logoSrcs: [
			"/images/integrations/claude.svg",
			"/images/integrations/cursor.svg",
			"/images/integrations/chatgpt.svg",
		],
		href: (orgId) => orgRoutes.integrations(orgId),
		publishedAt: "2026-09-20",
		expiresAt: "2026-10-04",
	},
];

export const TALENT_ANNOUNCEMENTS: readonly TalentAnnouncement[] = [
	{
		id: "talent-clera-mcp-2026-09",
		label: "Clera MCP",
		body: "Find new roles, ask Claude about your matches, accept interviews and tune your preferences without leaving the chat. About a minute to set up.",
		ctaLabel: "Connect in Claude",
		logoSrcs: ["/images/integrations/claude.svg"],
		href: externalRoutes.claudeAddConnector,
		external: true,
		minEloScore: ELO_FAST_TRACK_THRESHOLD,
		publishedAt: "2026-09-21",
		expiresAt: "2026-10-05",
	},
];

function parseAnnouncementDate(value: string, announcementId: string): number {
	const parsed = parseDate(value);
	if (parsed === null) {
		throw new Error(`Sidebar announcement "${announcementId}" has an unparseable date: ${value}`);
	}
	return parsed.getTime();
}

export function selectLiveAnnouncement<T extends SidebarAnnouncement>(
	now: Date,
	announcements: readonly T[],
): T | null {
	const nowMs = now.getTime();
	const live = announcements.filter((announcement) => {
		const publishedAt = parseAnnouncementDate(announcement.publishedAt, announcement.id);
		const expiresAt = parseAnnouncementDate(announcement.expiresAt, announcement.id);
		return publishedAt <= nowMs && expiresAt > nowMs;
	});
	if (live.length === 0) return null;
	return live.reduce((newest, candidate) =>
		parseAnnouncementDate(candidate.publishedAt, candidate.id) > parseAnnouncementDate(newest.publishedAt, newest.id)
			? candidate
			: newest,
	);
}

export function selectLiveTalentAnnouncement(
	now: Date,
	eloScore: number | null | undefined,
	announcements: readonly TalentAnnouncement[] = TALENT_ANNOUNCEMENTS,
): TalentAnnouncement | null {
	if (eloScore === null || eloScore === undefined) return null;
	return selectLiveAnnouncement(
		now,
		announcements.filter((announcement) => eloScore >= announcement.minEloScore),
	);
}

export function announcementDismissKey(announcementId: string): string {
	return `clera-org-announcement-dismissed-${announcementId}`;
}
