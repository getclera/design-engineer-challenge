import { findReviewItemByOpportunity } from "@mock/feed";
import { error, json, latency, requireUser } from "@mock/http";
import { decisions, reviewItemKey } from "@mock/store";

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't make decisions", 403);

  const { opportunityId } = (await request.json()) as { opportunityId: number };
  const item = findReviewItemByOpportunity(opportunityId);
  if (!item) return error("Opportunity not found", 404);

  await latency(200, 600);
  decisions.delete(reviewItemKey(item));
  return json({ success: true });
}
