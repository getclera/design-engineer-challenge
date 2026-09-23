import { json, requireUser } from "@mock/http";

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({ drops: [] });
}
