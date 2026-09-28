import { error, json, latency, requireUser } from "@mock/http";
import { COMPANY_PROFILE } from "@mock/org";
import type { FundingRound } from "@v2/features/org-settings/company-profile";

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json(COMPANY_PROFILE.rounds);
}

/** Add a round the data providers missed. */
export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;
  if (user.orgRole === "viewer") return error("Viewers can't change funding", 403);
  const body = (await request.json()) as Partial<Record<keyof FundingRound, unknown>>;
  const text = (key: "round" | "amount" | "date" | "investors") =>
    typeof body[key] === "string" ? (body[key] as string).trim().slice(0, 120) : "";
  if (!text("round")) return error("Name the round, like Seed", 400);
  if (!text("amount")) return error("Add the amount, like $3M", 400);
  await latency(200, 500);
  const round: FundingRound = {
    id: crypto.randomUUID(),
    round: text("round"),
    amount: text("amount"),
    date: text("date"),
    investors: text("investors"),
    auto: false,
  };
  COMPANY_PROFILE.rounds.push(round);
  return json(round, 201);
}
