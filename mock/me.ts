import type { MyProfile } from "@/features/org-settings/my-profile";
import { ACTIVE_CONTACTS } from "./org";
import { ROLES } from "./roles";
import { type MockUser, USERS } from "./users";

/** Your profile, as Settings › Profile shows it. Your contact (if you take intro calls) is matched by email. */
export function myProfile(user: MockUser): MyProfile {
  const contact = ACTIVE_CONTACTS.find((c) => c.email === user.email) ?? null;
  return {
    id: user.profileId,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    title: user.title,
    avatarUrl: user.avatarUrl,
    role: user.orgRole === "owner" ? "owner" : "viewer",
    notifications: user.notifications,
    contactId: contact?.id ?? null,
    calendarLink: contact?.calendarLink ?? null,
    roles: contact
      ? ROLES.filter((r) => r.status === "active" && r.companyContactId === contact.id).map((r) => ({
          id: r.id,
          position: r.position,
        }))
      : [],
    onlyOwner: user.orgRole === "owner" && USERS.filter((u) => u.orgRole === "owner").length === 1,
  };
}
