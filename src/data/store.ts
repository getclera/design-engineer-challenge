import type { ReviewAction } from "@/types";

interface Decision {
  action: ReviewAction;
  decidedAt: string;
}

const globalStore = globalThis as unknown as { __reviewDecisions?: Map<string, Decision> };

export const decisions: Map<string, Decision> = (globalStore.__reviewDecisions ??= new Map());
