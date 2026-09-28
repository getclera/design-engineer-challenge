import type { AppOrgRole } from "@clera/auth";
import type { MyNotifications } from "@/features/org-settings/delivery";

export interface MockUser {
  id: string;
  profileId: string;
  firstName: string;
  lastName: string;
  email: string;
  orgRole: AppOrgRole;
  avatarUrl: string | null;
  /** Settings › Profile. */
  title: string;
  joinedAt: string;
  /** Settings › Communications › Notifications. */
  notifications: MyNotifications;
}

export const MOCK_OTP_CODE = "424242";

// On globalThis so role changes and removals from Settings survive dev hot reloads.
const globalUsers = globalThis as unknown as { __users?: MockUser[] };

export const USERS: MockUser[] = (globalUsers.__users ??= [
  {
    id: "u_robin",
    profileId: "9a8b7c6d-0000-4000-8000-000000000001",
    firstName: "Robin",
    lastName: "Keller",
    email: "robin@tidewater.example",
    orgRole: "owner",
    avatarUrl: null,
    title: "CTO",
    joinedAt: "2026-03-02T09:14:00.000Z",
    notifications: { reviewReminders: true, onlyMyRoles: true },
  },
  {
    id: "u_sam",
    profileId: "9a8b7c6d-0000-4000-8000-000000000002",
    firstName: "Sam",
    lastName: "Ortiz",
    email: "sam@tidewater.example",
    orgRole: "viewer",
    avatarUrl: null,
    title: "Talent partner",
    joinedAt: "2026-06-15T10:02:00.000Z",
    notifications: { reviewReminders: false, onlyMyRoles: false },
  },
]);

// Users kept from before these fields existed.
for (const user of USERS) {
  user.title ??= "";
  user.joinedAt ??= "2026-03-02T09:14:00.000Z";
  user.notifications ??= { reviewReminders: true, onlyMyRoles: false };
}

/** How Settings › Members lists someone. */
export const toMember = (user: MockUser) => ({
  id: user.profileId,
  role: user.orgRole,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  avatarUrl: user.avatarUrl,
  joinedAt: user.joinedAt,
});

export const DEFAULT_OAUTH_USER = USERS[0];

export function findUserByEmail(email: string): MockUser | undefined {
  return USERS.find((user) => user.email === email.trim().toLowerCase());
}
