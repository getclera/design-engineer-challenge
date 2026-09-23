import type { ReviewBucketCounts, ReviewItem, ReviewListData } from "@/types";
import { reviewItemKey } from "@/lib/categories";
import { REVIEW_ITEM_SEEDS } from "./review-items";
import { ROLES } from "./roles";

const HIDDEN_BEYOND_PAGE_BY_ROLE: Record<string, number> = { role_backend: 9, role_ml: 4 };
const PAUSED_PENDING: Record<string, number> = { role_growth: 6 };

function toReviewItem(seed: (typeof REVIEW_ITEM_SEEDS)[number], index: number, now: number): ReviewItem {
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

export function buildReviewFeed({ roleId, decidedKeys }: { roleId: string | null; decidedKeys: Set<string> }): ReviewListData {
  const now = Date.now();
  const pending = REVIEW_ITEM_SEEDS.map((seed, index) => toReviewItem(seed, index, now)).filter(
    (item) => !decidedKeys.has(reviewItemKey(item)),
  );

  const byRole = Object.fromEntries(
    ROLES.filter((role) => role.status === "open").map((role) => {
      const visible = pending.filter((item) => item.roleId === role.id).length;
      const hidden = HIDDEN_BEYOND_PAGE_BY_ROLE[role.id] ?? 0;
      return [role.id, { pending: visible + hidden, truncated: hidden > 0 }];
    }),
  );

  const items = roleId ? pending.filter((item) => item.roleId === roleId) : pending;
  const hidden = roleId ? (HIDDEN_BEYOND_PAGE_BY_ROLE[roleId] ?? 0) : Object.values(HIDDEN_BEYOND_PAGE_BY_ROLE).reduce((a, b) => a + b, 0);

  return {
    items,
    totalCount: items.length + hidden,
    truncated: hidden > 0,
    counts: countBuckets(items),
    byRole,
    pausedPending: PAUSED_PENDING,
  };
}
