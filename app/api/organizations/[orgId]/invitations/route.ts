import { error, json, latency, requireUser } from "@mock/http";
import { INVITATIONS } from "@mock/org";

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({ invitations: INVITATIONS });
}

/** Cancel an invitation (`?invitationId=`, the shape the client already uses). */
export async function DELETE(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't cancel invitations", 403);
  const id = new URL(request.url).searchParams.get("invitationId");
  const index = INVITATIONS.findIndex((i) => i.id === id);
  if (index === -1) return error("Invitation not found", 404);
  await latency(150, 400);
  INVITATIONS.splice(index, 1);
  return json({ success: true });
}
