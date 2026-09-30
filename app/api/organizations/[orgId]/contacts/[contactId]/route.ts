import { error, json, latency, requireUser } from "@mock/http";
import { ACTIVE_CONTACTS } from "@mock/org";

/** Save a contact's scheduling link (Home's "Fix" for a hiring manager intros can't be booked with). */
export async function PATCH(request: Request, { params }: { params: Promise<{ contactId: string }> }) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't change contacts", 403);
  const { contactId } = await params;
  const contact = ACTIVE_CONTACTS.find((c) => c.id === contactId);
  if (!contact) return error("Contact not found", 404);
  const { calendarLink } = (await request.json()) as { calendarLink?: string | null };
  if (calendarLink && !/^https:\/\/\S+\.\S+/.test(calendarLink)) return error("Scheduling link must start with https://", 400);
  await latency(200, 500);
  contact.calendarLink = calendarLink || null;
  return json(contact);
}
