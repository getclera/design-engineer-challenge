import { cookies } from "next/headers";
import { findUserByEmail, type MockUser, USERS } from "./users";

export type DecisionAction = "interview" | "pass";

interface Decision {
  action: DecisionAction;
  decidedAt: string;
}

const globalStore = globalThis as unknown as { __reviewDecisions?: Map<string, Decision> };

export const decisions: Map<string, Decision> = (globalStore.__reviewDecisions ??= new Map());

export function reviewItemKey({ talentId, roleId }: { talentId: string; roleId: string | null }): string {
  return `${talentId}:${roleId ?? "__general__"}`;
}

export const SESSION_COOKIE = "challenge_session";

export async function currentUser(): Promise<MockUser | null> {
  const store = await cookies();
  const userId = store.get(SESSION_COOKIE)?.value;
  return USERS.find((user) => user.id === userId) ?? null;
}

export { findUserByEmail };
