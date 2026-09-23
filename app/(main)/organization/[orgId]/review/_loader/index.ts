import "server-only";

import { cache } from "react";
import { buildReviewFeed } from "@mock/feed";

export const loadReviewItems = cache(async ({ roleId }: { orgId: string; roleId?: string }) =>
  buildReviewFeed({ roleId: roleId ?? null }),
);

export interface SendoutScope {
  jobId: string;
  talentIds: string[];
}

export const loadSendoutScope = cache(async (_input: { orgId: string; nanoId: string }): Promise<SendoutScope | null> => null);
