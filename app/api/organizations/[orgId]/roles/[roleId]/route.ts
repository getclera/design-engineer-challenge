import { error, json, latency, requireUser } from "@mock/http";
import { ROLES } from "@mock/roles";

/** Pause or resume a role (Home's "Resume"). Other role edits live on the Roles pages, outside this challenge. */
export async function PATCH(request: Request, { params }: { params: Promise<{ roleId: string }> }) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't change roles", 403);
  const { roleId } = await params;
  const role = ROLES.find((r) => r.id === roleId);
  if (!role) return error("Role not found", 404);
  const { status } = (await request.json()) as { status?: string };
  if (status !== "active" && status !== "paused") return error("Unsupported change", 400);
  await latency(200, 500);
  role.status = status;
  return json({ success: true });
}
