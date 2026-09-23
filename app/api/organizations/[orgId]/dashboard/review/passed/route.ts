import { buildPassedFeed } from "@mock/feed";
import { json, latency, requireUser } from "@mock/http";

export async function GET(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  await latency(300, 800);
  const roleId = new URL(request.url).searchParams.get("roleId");
  return json(buildPassedFeed({ roleId }));
}
