import { error, json, latency, requireUser } from "@mock/http";
import { INVITATIONS } from "@mock/org";
import { toMember, USERS } from "@mock/users";

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({
    members: USERS.map(toMember),
  });
}

/** Invite someone by email. No email goes out: the invitation just waits in the list. */
export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't invite people", 403);
  const { email, role } = (await request.json()) as { email?: string; role?: string };
  const address = email?.trim().toLowerCase() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return error("That doesn't look like an email address", 400);
  if (role !== "owner" && role !== "viewer") return error("Pick owner or viewer", 400);
  if (USERS.some((u) => u.email === address)) return error("Already on the team", 409);
  if (INVITATIONS.some((i) => i.email === address)) return error("Already invited. Resend it below.", 409);
  await latency(200, 500);
  const invitation = { id: crypto.randomUUID(), email: address, role, sentAt: new Date().toISOString() } as const;
  INVITATIONS.unshift(invitation);
  return json(invitation, 201);
}
