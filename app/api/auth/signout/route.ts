import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@mock/store";

export interface SignOutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function POST() {
  const response = NextResponse.json({ success: true } satisfies SignOutResponse);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
