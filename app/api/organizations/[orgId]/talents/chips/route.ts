import { allReviewItems } from "@mock/feed";
import { json, requireUser } from "@mock/http";

export async function GET(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const talentIds = new Set((new URL(request.url).searchParams.get("talentIds") ?? "").split(",").filter(Boolean));
  const seen = new Set<string>();
  const chips = allReviewItems()
    .filter((item) => talentIds.has(item.talentId) && !seen.has(item.talentId) && seen.add(item.talentId))
    .map((item) => ({ talentId: item.talentId, companies: item.companies, school: item.school }));
  return json({ chips });
}
