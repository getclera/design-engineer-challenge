import { json, requireUser } from "@mock/http";
import { ACTIVE_CONTACTS } from "@mock/org";

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json(ACTIVE_CONTACTS);
}
