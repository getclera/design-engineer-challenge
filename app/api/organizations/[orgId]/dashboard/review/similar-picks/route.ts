import { json, latency, requireUser } from "@mock/http";
import { similarPicksFor } from "@mock/similar-picks";

export async function GET(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  await latency(400, 1000);
  const params = new URL(request.url).searchParams;
  return json({ picks: similarPicksFor({ roleId: params.get("roleId"), anchorTalentId: params.get("talentId") }) });
}
