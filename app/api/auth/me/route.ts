import type { AppRole, Profile } from "@/types/user";
import { json } from "@mock/http";
import { authMeFor } from "@mock/session";
import { currentUser } from "@mock/store";

export interface AuthMeResponse {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    createdAt: string;
  } | null;
  profile: {
    id: string;
    role: AppRole;
    firstName: string | null;
    lastName: string | null;
  } | null;
  fullProfile: Profile | null;
  session: {
    expiresAt: string;
  } | null;
}

export async function GET() {
  return json(authMeFor(await currentUser()));
}
