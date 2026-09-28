import { error, json, latency, requireUser } from "@mock/http";
import { USERS } from "@mock/users";

type Params = { params: Promise<{ memberId: string }> };

const owners = () => USERS.filter((u) => u.orgRole === "owner").length;

/** Make someone an owner or a viewer. There's always at least one owner. */
export async function PATCH(request: Request, { params }: Params) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't change roles", 403);
  const { memberId } = await params;
  const member = USERS.find((u) => u.profileId === memberId);
  if (!member) return error("Member not found", 404);
  const { role } = (await request.json()) as { role?: string };
  if (role !== "owner" && role !== "viewer") return error("Pick owner or viewer", 400);
  if (member.orgRole === "owner" && role === "viewer" && owners() === 1)
    return error("Make someone else an owner first", 409);
  await latency(200, 500);
  member.orgRole = role;
  return json({ id: member.profileId, role: member.orgRole });
}

/** Remove someone from the team. Not yourself, and never the last owner. */
export async function DELETE(_request: Request, { params }: Params) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't remove people", 403);
  const { memberId } = await params;
  const index = USERS.findIndex((u) => u.profileId === memberId);
  if (index === -1) return error("Member not found", 404);
  if (USERS[index].id === user.id) return error("You can't remove yourself", 409);
  if (USERS[index].orgRole === "owner" && owners() === 1) return error("Make someone else an owner first", 409);
  await latency(200, 500);
  USERS.splice(index, 1);
  return json({ success: true });
}
