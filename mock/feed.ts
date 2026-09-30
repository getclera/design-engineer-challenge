import type { DecidedThisWeek, ReviewBucketCounts, ReviewItem, ReviewListData } from "@/lib/review-feed";
import { ROLE_IDS } from "./ids";
import { ALL_ITEM_SEEDS, LATER_PAGE_SEEDS, type ReviewItemSeed } from "./review-items";
import { ROLES } from "./roles";
import { type DecisionAction, decisions, reviewItemKey } from "./store";

// People on the feed's second page: counted from the start, only listed once the board asks for more.
const ON_LATER_PAGE = new Set(LATER_PAGE_SEEDS.map(reviewItemKey));
const DAY_MS = 86_400_000;

// A few decisions from earlier this week, so Home's "you decided this week" isn't empty on a fresh start.
// Nobody who asked to meet is among them: they're the ones Home asks you to answer.
const DECIDED_EARLIER: { name: string; roleId: string; action: DecisionAction; daysAgo: number }[] = [
  { name: "Aiko Morimoto", roleId: ROLE_IDS.ml, action: "interview", daysAgo: 0.3 },
  { name: "Prince", roleId: ROLE_IDS.backend, action: "pass", daysAgo: 2 },
  { name: "Lukas Hoffmann", roleId: ROLE_IDS.design, action: "pass", daysAgo: 4 },
  { name: "Chloé Dubois", roleId: ROLE_IDS.design, action: "maybe", daysAgo: 1 },
];
const seeded = globalThis as unknown as { __decisionsSeeded?: boolean };
if (!seeded.__decisionsSeeded) {
  seeded.__decisionsSeeded = true;
  for (const { name, roleId, action, daysAgo } of DECIDED_EARLIER) {
    const seed = ALL_ITEM_SEEDS.find((s) => s.talentName === name && s.roleId === roleId);
    if (!seed) continue;
    decisions.set(reviewItemKey(seed), { action, decidedAt: new Date(Date.now() - daysAgo * DAY_MS).toISOString() });
  }
}

const isActive = (roleId: string) => ROLES.some((role) => role.id === roleId && role.status === "active");

function decidedThisWeek(): DecidedThisWeek {
  const week = { intro: 0, maybe: 0, pass: 0 };
  for (const { action, decidedAt } of decisions.values()) {
    if (Date.now() - Date.parse(decidedAt) > 7 * DAY_MS) continue;
    week[action === "interview" ? "intro" : action] += 1;
  }
  return week;
}

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
  return ALL_ITEM_SEEDS.map((seed, index) => toReviewItem(seed, index, now));
}

export function findReviewItem({ talentId, roleId }: { talentId: string; roleId: string | null }): ReviewItem | undefined {
  return allReviewItems().find((item) => item.talentId === talentId && item.roleId === roleId);
}

export function findReviewItemByOpportunity(opportunityId: number): ReviewItem | undefined {
  return allReviewItems().find((item) => item.opportunityId === opportunityId);
}

export function buildReviewFeed({ roleId, more }: { roleId: string | null; more: boolean }): ReviewListData {
  // Maybe keeps someone pending: they stay in the feed, flagged with their note.
  // A paused role's people wait behind the pause: not in Review until it's resumed.
  const pending = allReviewItems().flatMap((item) => {
    if (item.roleId && !isActive(item.roleId)) return [];
    const decision = decisions.get(reviewItemKey(item));
    if (!decision) return [item];
    return decision.action === "maybe" ? [{ ...item, maybe: { note: decision.note ?? "" } }] : [];
  });

  const byRole = Object.fromEntries(
    ROLES.filter((role) => role.status === "active").map((role) => {
      // Maybes have their own tab: "waiting" counts only people nobody has decided on yet.
      // It counts the second page too, so it is exact: no "+".
      return [role.id, { pending: pending.filter((item) => item.roleId === role.id && !item.maybe).length, truncated: false }];
    }),
  );

  const inScope = roleId ? pending.filter((item) => item.roleId === roleId) : pending;
  // A maybe stays listed wherever it came from; undecided second-page people wait for "more".
  const held = (item: ReviewItem) => !more && !item.maybe && ON_LATER_PAGE.has(reviewItemKey(item));
  const items = inScope.filter((item) => !held(item));
  const hidden = inScope.length - items.length;

  return {
    items,
    totalCount: items.length + hidden,
    truncated: hidden > 0,
    counts: countBuckets(items),
    byRole,
    pausedPending: Object.fromEntries(
      ROLES.filter((role) => role.status === "paused").map((role) => [
        role.id,
        allReviewItems().filter((i) => i.roleId === role.id && !decisions.has(reviewItemKey(i))).length,
      ]),
    ),
    decidedThisWeek: decidedThisWeek(),
  };
}

export function buildPassedFeed({ roleId }: { roleId: string | null }): { items: ReviewItem[]; totalCount: number } {
  const passed = allReviewItems().filter((item) => decisions.get(reviewItemKey(item))?.action === "pass");
  const items = roleId ? passed.filter((item) => item.roleId === roleId) : passed;
  return { items, totalCount: items.length };
}
