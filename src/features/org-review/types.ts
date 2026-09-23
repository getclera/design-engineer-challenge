import type { organizationCommands } from "@edge-functions/organization-service/commands";
import type { ReviewBucket, ReviewItem } from "@v2/lib/review-feed";
import type { z } from "zod";

export type {
	ReviewBucket,
	ReviewBucketCounts,
	ReviewItem,
	ReviewListData,
	ReviewSource,
} from "@v2/lib/review-feed";

export const REVIEW_STREAMS = ["curated", "drop", "interest"] as const;

export type ReviewStream = (typeof REVIEW_STREAMS)[number];

export const streamOf = (bucket: ReviewBucket): ReviewStream => {
	if (bucket === "intro_request") return "interest";
	if (bucket === "role_specific") return "curated";
	return "drop";
};

export const reviewItemKey = (item: Pick<ReviewItem, "talentId" | "roleId">) =>
	`${item.talentId}:${item.roleId ?? "__general__"}`;

export type SimilarPick = z.infer<
	(typeof organizationCommands)["review"]["list_similar_picks"]["output"]
>["picks"][number];
