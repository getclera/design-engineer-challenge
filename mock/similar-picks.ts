import type { SimilarPick } from "@/features/org-review/types";
import { allReviewItems } from "./feed";
import { ROLE_IDS, talentUuid } from "./ids";
import { decisions, reviewItemKey } from "./store";

interface SimilarSeed {
  talentKey: string;
  facet: SimilarPick["facet"];
  facetLabel: string;
  reason: string;
  evidenceQuotes: string[];
}

const SIMILAR_BY_ANCHOR: Record<string, SimilarSeed[]> = {
  [`${talentUuid("t01")}:${ROLE_IDS.backend}`]: [
    {
      talentKey: "t28",
      facet: "role",
      facetLabel: "Same kind of role",
      reason: "Also built multi-tenant money movement from scratch, at Cobalt Freight.",
      evidenceQuotes: ["Owns multi-tenant billing end to end", "Wants founding scope"],
    },
    {
      talentKey: "t22",
      facet: "caliber",
      facetLabel: "Similar caliber",
      reason: "Deep ledger experience, though more senior than Mara.",
      evidenceQuotes: ["Technical lead for the core banking ledger"],
    },
  ],
  [`${talentUuid("t03")}:${ROLE_IDS.design}`]: [
    {
      talentKey: "t30",
      facet: "background",
      facetLabel: "Similar background",
      reason: "Design-system minded, ships in regulated fintech.",
      evidenceQuotes: ["Redesigned Kestrel Pay's KYC flow"],
    },
  ],
};

export function similarPicksFor({ roleId, anchorTalentId }: { roleId: string | null; anchorTalentId: string | null }): SimilarPick[] {
  const seeds = SIMILAR_BY_ANCHOR[`${anchorTalentId}:${roleId}`] ?? [];
  const items = allReviewItems();
  return seeds.flatMap((seed) => {
    const item = items.find((candidate) => candidate.talentId === talentUuid(seed.talentKey) && candidate.roleId === roleId);
    if (!item || decisions.has(reviewItemKey(item))) return [];
    return [
      {
        talentId: item.talentId,
        reason: seed.reason,
        facet: seed.facet,
        evidenceQuotes: seed.evidenceQuotes,
        facetLabel: seed.facetLabel,
        talentName: item.talentName,
        talentAvatarUrl: item.talentAvatarUrl,
        headline: item.headline,
        companies: item.companies,
        school: item.school,
      },
    ];
  });
}
