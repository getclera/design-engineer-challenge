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
}

export interface ReviewBucketCounts {
	all: number;
	intro_request: number;
	role_specific: number;
	weekly_drop: number;
	public_drop: number;
}

export interface ReviewListData {
	items: ReviewItem[];
	totalCount: number;
	truncated: boolean;
	counts: ReviewBucketCounts;
	byRole: Record<string, RoleReviewCounts>;
	pausedPending: Record<string, number>;
}

const EMPTY_BUCKET_COUNTS: ReviewBucketCounts = {
	all: 0,
	intro_request: 0,
	role_specific: 0,
	weekly_drop: 0,
	public_drop: 0,
};

export function reviewFeedQueryOptions(orgId: string, roleId?: string) {
	return {
		queryKey: orgDashboardKeys.review(orgId, roleId),
		queryFn: async (): Promise<ReviewListData> => {
			const result = await organizations.getReviewItems<ReviewItem>(orgId, { roleId });
			if (!result.ok) throw new Error("Failed to load review queue");
			return {
				items: result.data.items,
				totalCount: result.data.totalCount,
				truncated: result.data.truncated ?? false,
				counts: result.data.counts ?? EMPTY_BUCKET_COUNTS,
				byRole: result.data.byRole ?? {},
				pausedPending: result.data.pausedPending ?? {},
			};
		},
	};
}
