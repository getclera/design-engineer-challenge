import type { MovingForwardPerson, PipelineStage } from "@v2/features/org-home/home-summary";
import { ROLE_IDS } from "./ids";
import { REVIEW_ITEM_SEEDS } from "./review-items";
import { ROLES } from "./roles";
import { decisions, reviewItemKey } from "./store";

const DAY_MS = 86_400_000;

// Assumed data: the challenge API only has stage counts per role (pipelineStages), not the people in them.
// These match those counts, so Home can show what Clera delivered past the intro.
const PAST_THE_INTRO: { name: string; roleId: string; stage: PipelineStage; daysAgo?: number; next?: string }[] = [
  { name: "Inês Duarte", roleId: ROLE_IDS.design, stage: "offer", daysAgo: 2 },
  { name: "Ana Kovač", roleId: ROLE_IDS.backend, stage: "interviewing", next: "Round 2 · Tue" },
  { name: "Sofia Marchetti", roleId: ROLE_IDS.backend, stage: "call", next: "Thu 14:00" },
  { name: "Ruth Adeyemi", roleId: ROLE_IDS.design, stage: "call", next: "Fri 10:30" },
];

const roleName = (roleId: string) => ROLES.find((role) => role.id === roleId)?.position ?? "";

/** Everyone you said yes to: this week's intros (from your decisions), then the people further along. */
export function buildMovingForward(now = Date.now()): MovingForwardPerson[] {
  const intros = REVIEW_ITEM_SEEDS.flatMap((seed) => {
    const decision = decisions.get(reviewItemKey(seed));
    if (!seed.roleId || decision?.action !== "interview" || now - Date.parse(decision.decidedAt) > 7 * DAY_MS) return [];
    return [
      {
        key: reviewItemKey(seed),
        name: seed.talentName,
        roleId: seed.roleId,
        roleName: roleName(seed.roleId),
        stage: "intro" as const,
        at: decision.decidedAt,
        next: null,
      },
    ];
  });
  const later = PAST_THE_INTRO.map(({ name, roleId, stage, daysAgo, next }) => ({
    key: `${name}:${roleId}`,
    name,
    roleId,
    roleName: roleName(roleId),
    stage,
    at: daysAgo === undefined ? null : new Date(now - daysAgo * DAY_MS).toISOString(),
    next: next ?? null,
  }));
  return [...later, ...intros.sort((a, b) => Date.parse(b.at) - Date.parse(a.at))];
}
