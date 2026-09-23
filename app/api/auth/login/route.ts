import { NextResponse } from "next/server";
import { DEMO_PASSWORD, USERS } from "@/data/users";
import { randomLatency } from "@/lib/latency";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email?: unknown; password?: unknown };
  await randomLatency(400, 1000);
  const user = USERS.find((u) => typeof email === "string" && u.email === email.trim().toLowerCase());
  if (!user || password !== DEMO_PASSWORD) {
    return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, user.id, { httpOnly: true, sameSite: "lax", path: "/" });
  return response;
}
