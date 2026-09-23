import type { AppOrgRole } from "@clera/auth";

export interface MockUser {
  id: string;
  profileId: string;
  firstName: string;
  lastName: string;
  email: string;
  orgRole: AppOrgRole;
  avatarUrl: string | null;
}

export const MOCK_OTP_CODE = "424242";

export const USERS: MockUser[] = [
  {
    id: "u_robin",
    profileId: "9a8b7c6d-0000-4000-8000-000000000001",
    firstName: "Robin",
    lastName: "Keller",
    email: "robin@tidewater.example",
    orgRole: "owner",
    avatarUrl: null,
  },
  {
    id: "u_sam",
    profileId: "9a8b7c6d-0000-4000-8000-000000000002",
    firstName: "Sam",
    lastName: "Ortiz",
    email: "sam@tidewater.example",
    orgRole: "viewer",
    avatarUrl: null,
  },
];

export const DEFAULT_OAUTH_USER = USERS[0];

export function findUserByEmail(email: string): MockUser | undefined {
  return USERS.find((user) => user.email === email.trim().toLowerCase());
}
