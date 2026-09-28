import { error, json, latency, requireUser } from "@mock/http";
import { ACTIVE_CONTACTS } from "@mock/org";

/** Add a hiring manager: someone at the company who takes intro calls (Settings › Team). */
export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't add contacts", 403);
  const body = (await request.json()) as { firstName?: string; lastName?: string; email?: string; title?: string };
  const firstName = body.firstName?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!firstName) return error("Add their name", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return error("That doesn't look like an email address", 400);
  if (ACTIVE_CONTACTS.some((c) => c.email === email)) return error("They're already a hiring manager", 409);
  await latency(200, 500);
  const contact = {
    id: crypto.randomUUID(),
    firstName,
    lastName: body.lastName?.trim() ?? "",
    email,
    title: body.title?.trim() || null,
    calendarLink: null,
    isPrimary: false,
    createdAt: new Date().toISOString(),
  };
  ACTIVE_CONTACTS.push(contact);
  return json(contact, 201);
}
