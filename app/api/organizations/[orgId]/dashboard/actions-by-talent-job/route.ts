import { findReviewItem } from "@mock/feed";
import { error, json, latency, requireUser } from "@mock/http";
import { decisions, reviewItemKey } from "@mock/store";

const FAILURE_RATE = 0.1;

interface ActionRequest {
  talentId: string;
  jobId: string;
  action: "request_intro" | "pass";
  noFitCategories?: string[];
  interestCompanyCategory?: string;
}

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't make decisions", 403);

  const body = (await request.json()) as ActionRequest;
  const item = findReviewItem({ talentId: body.talentId, roleId: body.jobId }) ?? findReviewItem({ talentId: body.talentId, roleId: null });
  if (!item) return error("Candidate not found", 404);

  await latency(400, 1500);
  if (Math.random() < FAILURE_RATE) return error("Something went wrong", 500);

  decisions.set(reviewItemKey(item), {
    action: body.action === "request_intro" ? "interview" : "pass",
    decidedAt: new Date().toISOString(),
  });
  return json({ success: true, opportunityId: item.opportunityId });
}
