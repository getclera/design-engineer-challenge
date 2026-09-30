import type { DecidedThisWeek, ReviewBucketCounts, ReviewItem, ReviewListData } from "@/lib/review-feed";
import { ROLE_IDS } from "./ids";
import { REVIEW_ITEM_SEEDS, type ReviewItemSeed } from "./review-items";
import { ROLES } from "./roles";
import { type DecisionAction, decisions, reviewItemKey } from "./store";

const HIDDEN_BEYOND_PAGE_BY_ROLE: Record<string, number> = { [ROLE_IDS.backend]: 9, [ROLE_IDS.ml]: 4 };
// Head of Growth has 3 people on this page and 3 beyond it; all held back while the role is paused.
const HIDDEN_WHILE_ACTIVE: Record<string, number> = { [ROLE_IDS.growth]: 3 };
const DAY_MS = 86_400_000;

// A few decisions from earlier this week, so Home's "you decided this week" isn't empty on a fresh start.
// Nobody who asked to meet is among them: they're the ones Home asks you to answer.
const DECIDED_EARLIER: { name: string; roleId: string; action: DecisionAction; daysAgo: number }[] = [
  { name: "Noah Becker", roleId: ROLE_IDS.backend, action: "interview", daysAgo: 0.5 },
  { name: "Aiko Morimoto", roleId: ROLE_IDS.ml, action: "interview", daysAgo: 0.3 },
  { name: "Prince", roleId: ROLE_IDS.backend, action: "pass", daysAgo: 2 },
  { name: "Lukas Hoffmann", roleId: ROLE_IDS.design, action: "pass", daysAgo: 4 },
  { name: "Chloé Dubois", roleId: ROLE_IDS.design, action: "maybe", daysAgo: 1 },
];
const seeded = globalThis as unknown as { __decisionsSeeded?: boolean };
if (!seeded.__decisionsSeeded) {
  seeded.__decisionsSeeded = true;
  for (const { name, roleId, action, daysAgo } of DECIDED_EARLIER) {
    const seed = REVIEW_ITEM_SEEDS.find((s) => s.talentName === name && s.roleId === roleId);
    if (!seed) continue;
    decisions.set(reviewItemKey(seed), { action, decidedAt: new Date(Date.now() - daysAgo * DAY_MS).toISOString() });
  }
}

const isActive = (roleId: string) => ROLES.some((role) => role.id === roleId && role.status === "active");
const hiddenFor = (roleId: string) =>
  isActive(roleId) ? (HIDDEN_BEYOND_PAGE_BY_ROLE[roleId] ?? 0) + (HIDDEN_WHILE_ACTIVE[roleId] ?? 0) : 0;

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
  return REVIEW_ITEM_SEEDS.map((seed, index) => toReviewItem(seed, index, now));
}

export function findReviewItem({ talentId, roleId }: { talentId: string; roleId: string | null }): ReviewItem | undefined {
  return allReviewItems().find((item) => item.talentId === talentId && item.roleId === roleId);
}

export function findReviewItemByOpportunity(opportunityId: number): ReviewItem | undefined {
  return allReviewItems().find((item) => item.opportunityId === opportunityId);
}

export function buildReviewFeed({ roleId }: { roleId: string | null }): ReviewListData {
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
      const visible = pending.filter((item) => item.roleId === role.id && !item.maybe).length;
      const hidden = hiddenFor(role.id);
      // The count already includes the people past the page, so it is exact: no "+".
      return [role.id, { pending: visible + hidden, truncated: false }];
    }),
  );

  const items = roleId ? pending.filter((item) => item.roleId === roleId) : pending;
  const hidden = roleId ? hiddenFor(roleId) : ROLES.reduce((sum, role) => sum + hiddenFor(role.id), 0);

  return {
    items,
    totalCount: items.length + hidden,
    truncated: hidden > 0,
    counts: countBuckets(items),
    byRole,
    pausedPending: Object.fromEntries(
      ROLES.filter((role) => role.status === "paused").map((role) => [
        role.id,
        allReviewItems().filter((i) => i.roleId === role.id && !decisions.has(reviewItemKey(i))).length +
          (HIDDEN_WHILE_ACTIVE[role.id] ?? 0),
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
