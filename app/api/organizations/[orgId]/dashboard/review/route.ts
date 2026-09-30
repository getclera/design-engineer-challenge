import { buildReviewFeed } from "@mock/feed";
import { error, json, latency, listFailRequested, requireUser } from "@mock/http";

export async function GET(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  await latency(300, 900);
  if (listFailRequested(request)) return error("Simulated outage", 503);
  const params = new URL(request.url).searchParams;
  return json(buildReviewFeed({ roleId: params.get("roleId"), more: params.get("more") === "1" }));
}
