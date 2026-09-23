export type SignupIntent = "company";

export interface EmailCodeResult {
  error: { code?: string; message?: string; longMessage?: string } | null;
}

export interface ClerkGlobal {
  session?: { getToken: (options?: { skipCache?: boolean }) => Promise<string | null> } | null;
  setActive: (params: { session?: string | null; organization?: string | null }) => Promise<void>;
}

function unavailable(): never {
  throw new Error("Real authentication is not part of the challenge — the mock login in src/features/auth/use-auth-flow.ts replaces it");
}

export function readClerkGlobal(): ClerkGlobal | undefined {
  return undefined;
}

export async function getLoadedClerk(): Promise<ClerkGlobal> {
  return { session: null, setActive: async () => {} };
}

export async function startOAuthRedirect(_params: unknown): Promise<void> {
  unavailable();
}

export async function signOutClerk(): Promise<void> {
  await fetch("/api/auth/signout", { method: "POST" });
}

export async function sendEmailCode(..._args: unknown[]): Promise<EmailCodeResult> {
  unavailable();
}

export async function verifyEmailCode(..._args: unknown[]): Promise<EmailCodeResult> {
  unavailable();
}

export async function setActiveOrganization(_orgId: string): Promise<void> {}
