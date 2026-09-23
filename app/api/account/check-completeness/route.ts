import { orgRoutes } from "@clera/route-factory";
import { json } from "@mock/http";
import { ORG_ID } from "@mock/ids";
import { currentUser } from "@mock/store";

export interface AccountCompletenessResponse {
  success: boolean;
  shouldRedirect?: boolean;
  redirectTo?: string;
  error?: string;
  statusCode?: number;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return json({ success: false, shouldRedirect: false } satisfies AccountCompletenessResponse);
  return json({ success: true, shouldRedirect: true, redirectTo: orgRoutes.review(ORG_ID) } satisfies AccountCompletenessResponse);
}
