import type { z } from "zod";
import type { CommandTree } from "../../command-tree";

type Chip = { name: string; logoUrl: string | null };

export interface SimilarPickRecord {
  talentId: string;
  reason: string;
  facet: "embedding" | "caliber" | "role" | "background" | "colike" | "pedigree_school" | "pedigree_employer";
  evidenceQuotes: string[];
  facetLabel: string;
  talentName: string;
  talentAvatarUrl: string | null;
  headline: string | null;
  companies: Chip[];
  school: Chip | null;
}

type ListSimilarPicks = {
  input: z.ZodType<{ orgId: string; roleId: string; anchorTalentId: string }>;
  output: z.ZodType<{ picks: SimilarPickRecord[] }>;
};

export declare const organizationCommands: CommandTree & {
  review: CommandTree[string] & { list_similar_picks: ListSimilarPicks };
};
