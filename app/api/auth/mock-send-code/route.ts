import { error, json, latency } from "@mock/http";
import { findUserByEmail } from "@mock/users";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email: string };
  await latency(400, 900);
  if (!findUserByEmail(email)) return error("We couldn't find an account for that email.", 404);
  return json({ success: true });
}
