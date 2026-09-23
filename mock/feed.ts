import type { ReviewBucketCounts, ReviewItem, ReviewListData } from "@/lib/review-feed";
import { ROLE_IDS } from "./ids";
import { REVIEW_ITEM_SEEDS, type ReviewItemSeed } from "./review-items";
import { ROLES } from "./roles";
import { decisions, reviewItemKey } from "./store";

const HIDDEN_BEYOND_PAGE_BY_ROLE: Record<string, number> = { [ROLE_IDS.backend]: 9, [ROLE_IDS.ml]: 4 };
const PAUSED_PENDING: Record<string, number> = { [ROLE_IDS.growth]: 6 };

function toReviewItem(seed: ReviewItemSeed, index: number, now: number): ReviewItem {
  const { receivedMinutesAgo, ...rest } = seed;
  return {
    ...rest,
    opportunityId: 48000 + index,
    receivedAt: receivedMinutesAgo === null ? null : new Date(now - receivedMinutesAgo * 60_000).toISOString(),
  };
}

function countBuckets(items: ReviewItem[]): ReviewBucketCounts {
  const counts: ReviewBucketCounts = { all: items.length, intro_request: 0, role_specific: 0, weekly_drop: 0, public_drop: 0 };
  for (const item of items) counts[item.bucket] += 1;
  return counts;
}

export function allReviewItems(): ReviewItem[] {
  const now = Date.now();
  return REVIEW_ITEM_SEEDS.map((seed, index) => toReviewItem(seed, index, now));
}

export function findReviewItem({ talentId, roleId }: { talentId: string; roleId: string | null }): ReviewItem | undefined {
  return allReviewItems().find((item) => item.talentId === talentId && item.roleId === roleId);
}

export function findReviewItemByOpportunity(opportunityId: number): ReviewItem | undefined {
  return allReviewItems().find((item) => item.opportunityId === opportunityId);
}

export function buildReviewFeed({ roleId }: { roleId: string | null }): ReviewListData {
  const pending = allReviewItems().filter((item) => !decisions.has(reviewItemKey(item)));

  const byRole = Object.fromEntries(
    ROLES.filter((role) => role.status === "active").map((role) => {
      const visible = pending.filter((item) => item.roleId === role.id).length;
      const hidden = HIDDEN_BEYOND_PAGE_BY_ROLE[role.id] ?? 0;
      return [role.id, { pending: visible + hidden, truncated: hidden > 0 }];
    }),
  );

  const items = roleId ? pending.filter((item) => item.roleId === roleId) : pending;
  const hidden = roleId
    ? (HIDDEN_BEYOND_PAGE_BY_ROLE[roleId] ?? 0)
    : Object.values(HIDDEN_BEYOND_PAGE_BY_ROLE).reduce((sum, count) => sum + count, 0);

  return {
    items,
    totalCount: items.length + hidden,
    truncated: hidden > 0,
    counts: countBuckets(items),
    byRole,
    pausedPending: PAUSED_PENDING,
  };
}

export function buildPassedFeed({ roleId }: { roleId: string | null }): { items: ReviewItem[]; totalCount: number } {
  const passed = allReviewItems().filter((item) => decisions.get(reviewItemKey(item))?.action === "pass");
  const items = roleId ? passed.filter((item) => item.roleId === roleId) : passed;
  return { items, totalCount: items.length };
}
