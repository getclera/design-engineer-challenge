import { error, json, requireUser } from "@mock/http";
import { ORG_ID } from "@mock/ids";
import { ORGANIZATION } from "@mock/org";

export async function GET(_request: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { orgId } = await params;
  if (orgId !== ORG_ID) return error("Organization not found", 404);
  return json(ORGANIZATION);
}
