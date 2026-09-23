import { json, requireUser } from "@mock/http";

export async function PATCH() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({ success: true });
}
