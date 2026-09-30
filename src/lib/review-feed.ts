import { orgDashboardKeys } from "@/lib/query-keys";
import { organizations } from "@/services/api";
import type { RoleReviewCounts } from "@/services/api/organizations";

export type ReviewSource = "intro_request" | "drop_list" | "submitted" | "drop" | "passed";

export type ReviewBucket = "intro_request" | "role_specific" | "weekly_drop" | "public_drop";

export interface ReviewItem {
	talentId: string;
	talentName: string;
	talentOneliner: string | null;
	talentAvatarUrl: string | null;
	roleId: string | null;
	roleName: string | null;
	opportunityId: number;
	source: ReviewSource;
	bucket: ReviewBucket;
	headline: string | null;
	fitReason: string | null;
	receivedAt: string | null;
	companies: { name: string; logoUrl: string | null }[];
	school: { name: string; logoUrl: string | null } | null;
	/** Set while the hiring manager has parked this person in Maybe. */
	maybe?: { note: string } | null;
}

export interface ReviewBucketCounts {
	all: number;
	intro_request: number;
	role_specific: number;
	weekly_drop: number;
	public_drop: number;
}

/** Decisions from the last 7 days, whoever made them. */
export interface DecidedThisWeek {
	intro: number;
	maybe: number;
	pass: number;
}

export interface ReviewListData {
	items: ReviewItem[];
	totalCount: number;
	truncated: boolean;
	counts: ReviewBucketCounts;
	byRole: Record<string, RoleReviewCounts>;
	pausedPending: Record<string, number>;
	decidedThisWeek: DecidedThisWeek;
}

const EMPTY_BUCKET_COUNTS: ReviewBucketCounts = {
	all: 0,
	intro_request: 0,
	role_specific: 0,
	weekly_drop: 0,
	public_drop: 0,
};

// Feeds the board has asked to extend past the first page. It lives outside the query key so every
// optimistic update keeps writing to the one cache entry. ponytail: one extra page, as the mock has.
const extendedFeeds = new Set<string>();
const feedId = (orgId: string, roleId?: string) => `${orgId}:${roleId ?? ""}`;

export const isFeedExtended = (orgId: string, roleId?: string) => extendedFeeds.has(feedId(orgId, roleId));

/** Ask for the rest of the feed: the next fetch of this list includes the second page. */
export function extendFeed(orgId: string, roleId?: string) {
	extendedFeeds.add(feedId(orgId, roleId));
}

export function reviewFeedQueryOptions(orgId: string, roleId?: string) {
	return {
		queryKey: orgDashboardKeys.review(orgId, roleId),
		queryFn: async (): Promise<ReviewListData> => {
			const more = isFeedExtended(orgId, roleId);
			const result = await organizations.getReviewItems<ReviewItem>(orgId, { roleId, more });
			if (!result.ok) throw new Error("Failed to load review queue");
			return {
				items: result.data.items,
				totalCount: result.data.totalCount,
				truncated: result.data.truncated ?? false,
				counts: result.data.counts ?? EMPTY_BUCKET_COUNTS,
				byRole: result.data.byRole ?? {},
				pausedPending: result.data.pausedPending ?? {},
				decidedThisWeek: result.data.decidedThisWeek ?? { intro: 0, maybe: 0, pass: 0 },
			};
		},
	};
}
