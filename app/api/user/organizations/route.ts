import { json, requireUser } from "@mock/http";
import { MY_ORGANIZATIONS } from "@mock/org";

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({ organizations: MY_ORGANIZATIONS(user.orgRole) });
}
