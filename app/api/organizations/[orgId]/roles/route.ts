import { json, latency, requireUser } from "@mock/http";
import { ROLES } from "@mock/roles";

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  await latency(200, 500);
  return json({ roles: ROLES });
}
