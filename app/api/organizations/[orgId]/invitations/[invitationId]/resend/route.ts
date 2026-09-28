import { error, json, latency, requireUser } from "@mock/http";
import { INVITATIONS } from "@mock/org";

/** Send the invitation again. Nothing is emailed in the mock; the sent time moves to now. */
export async function POST(_request: Request, { params }: { params: Promise<{ invitationId: string }> }) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't resend invitations", 403);
  const { invitationId } = await params;
  const invitation = INVITATIONS.find((i) => i.id === invitationId);
  if (!invitation) return error("Invitation not found", 404);
  await latency(200, 500);
  invitation.sentAt = new Date().toISOString();
  return json(invitation);
}
