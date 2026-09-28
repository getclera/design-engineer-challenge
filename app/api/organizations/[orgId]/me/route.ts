import { error, json, latency, requireUser } from "@mock/http";
import { myProfile } from "@mock/me";
import { ACTIVE_CONTACTS } from "@mock/org";
import { USERS } from "@mock/users";
import { type MyProfileUpdate, splitName } from "@v2/features/org-settings/my-profile";

const IMAGE = /^data:image\/(png|jpeg|webp|gif);base64,/;
const MAX_IMAGE_CHARS = 1_500_000;

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json(myProfile(user));
}

/** Everyone edits their own profile and notifications, viewers too. */
export async function PATCH(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const body = (await request.json()) as MyProfileUpdate;
  const contact = ACTIVE_CONTACTS.find((c) => c.email === user.email);

  if (body.name !== undefined && !splitName(body.name).firstName) return error("Add your name", 400);
  if (body.avatarUrl && !(IMAGE.test(body.avatarUrl) && body.avatarUrl.length <= MAX_IMAGE_CHARS))
    return error("Use a JPEG, PNG, GIF or WebP under 1 MB", 400);
  if (body.calendarLink !== undefined) {
    if (!contact) return error("You're not the contact for any role yet", 409);
    if (body.calendarLink && !/^https:\/\/\S+\.\S+/.test(body.calendarLink))
      return error("Calendar link must start with https://", 400);
  }
  const notifications = body.notifications;
  if (notifications && Object.values(notifications).some((v) => typeof v !== "boolean"))
    return error("Notifications are on or off", 400);

  await latency(150, 400);
  if (body.name !== undefined) {
    Object.assign(user, splitName(body.name));
    // The same person in Members › Contacts: one name everywhere.
    if (contact) Object.assign(contact, splitName(body.name));
  }
  if (body.title !== undefined) {
    user.title = body.title.trim().slice(0, 80);
    if (contact) contact.title = user.title || null;
  }
  if (body.avatarUrl !== undefined) user.avatarUrl = body.avatarUrl || null;
  if (body.calendarLink !== undefined && contact) contact.calendarLink = body.calendarLink || null;
  if (notifications) user.notifications = { ...user.notifications, ...notifications };
  return json(myProfile(user));
}

/** Leave the organization. Never the last owner: someone has to be able to change settings. */
export async function DELETE() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (myProfile(user).onlyOwner) return error("You're the only owner. Make someone else an owner first.", 409);
  await latency(300, 600);
  USERS.splice(USERS.indexOf(user), 1);
  return json({ success: true });
}
