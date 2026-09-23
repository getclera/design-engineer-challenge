import { type ClerkGlobal, getLoadedClerk } from "@clera/auth/client";

export async function clerkSessionToken(): Promise<string | null> {
	if (typeof window === "undefined") return null;
	const clerk = (window as { Clerk?: ClerkGlobal }).Clerk;
	return (await clerk?.session?.getToken()) ?? null;
}

export async function refreshClerkSessionToken(): Promise<string | null> {
	const clerk = await getLoadedClerk();
	return (await clerk.session?.getToken({ skipCache: true })) ?? null;
}
