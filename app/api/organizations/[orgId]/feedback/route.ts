import { json, requireUser } from "@mock/http";

export async function POST() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({ id: crypto.randomUUID() });
}
