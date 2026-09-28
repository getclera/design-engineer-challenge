import { error, json, latency, requireUser } from "@mock/http";
import { COMPANY_PROFILE } from "@mock/org";

/** Remove a round, including one our data providers found. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ roundId: string }> }) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't change funding", 403);
  const { roundId } = await params;
  const index = COMPANY_PROFILE.rounds.findIndex((r) => r.id === roundId);
  if (index === -1) return error("Round not found", 404);
  await latency(200, 500);
  const [removed] = COMPANY_PROFILE.rounds.splice(index, 1);
  return json(removed);
}
