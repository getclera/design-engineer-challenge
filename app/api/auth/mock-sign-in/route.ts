import { NextResponse } from "next/server";
import { error, latency } from "@mock/http";
import { SESSION_COOKIE } from "@mock/store";
import { DEFAULT_OAUTH_USER, findUserByEmail, MOCK_OTP_CODE } from "@mock/users";

type SignInRequest = { method: "google" | "linkedin_oidc" } | { method: "email_code"; email: string; code: string };

export async function POST(request: Request) {
  const body = (await request.json()) as SignInRequest;
  await latency(500, 1100);

  const user = body.method === "email_code" ? findUserByEmail(body.email) : DEFAULT_OAUTH_USER;
  if (body.method === "email_code" && body.code !== MOCK_OTP_CODE) return error("Incorrect code. Try again.", 422);
  if (!user) return error("We couldn't find an account for that email.", 404);

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, user.id, { httpOnly: true, sameSite: "lax", path: "/" });
  return response;
}
