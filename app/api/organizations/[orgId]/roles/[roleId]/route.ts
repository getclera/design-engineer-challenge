import { error, json, latency, requireUser } from "@mock/http";
import { ACTIVE_CONTACTS } from "@mock/org";
import { ROLES } from "@mock/roles";

/**
 * Pause or resume a role (Home's "Resume"), or pick who takes its intro calls (Settings › Team).
 * Other role edits live on the Roles pages, outside this challenge.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ roleId: string }> }) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't change roles", 403);
  const { roleId } = await params;
  const role = ROLES.find((r) => r.id === roleId);
  if (!role) return error("Role not found", 404);
  const { status, companyContactId } = (await request.json()) as { status?: string; companyContactId?: string };
  if (companyContactId !== undefined) {
    const contact = ACTIVE_CONTACTS.find((c) => c.id === companyContactId);
    if (!contact) return error("Hiring manager not found", 400);
    await latency(200, 500);
    role.companyContactId = contact.id;
    role.hiringManagerName = `${contact.firstName} ${contact.lastName}`.trim();
    return json({ success: true });
  }
  if (status !== "active" && status !== "paused") return error("Unsupported change", 400);
  await latency(200, 500);
  role.status = status;
  return json({ success: true });
}
