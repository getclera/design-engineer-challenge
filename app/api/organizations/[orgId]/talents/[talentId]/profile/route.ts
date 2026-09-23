import { error, json, latency, requireUser } from "@mock/http";
import { PROFILES } from "@mock/profiles";

export async function GET(_request: Request, { params }: { params: Promise<{ talentId: string }> }) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  const { talentId } = await params;
  await latency(250, 1200);
  const profile = PROFILES[talentId];
  if (!profile) return error("Talent not found", 404);
  return json(profile);
}
