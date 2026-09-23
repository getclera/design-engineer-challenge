import { NextResponse } from "next/server";
import { currentUser } from "./store";
import type { MockUser } from "./users";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function latency(minMs = 300, maxMs = 900): Promise<void> {
  return sleep(minMs + Math.random() * (maxMs - minMs));
}

export function json<T>(body: T, status = 200): NextResponse {
  return NextResponse.json(body, { status });
}

export function error(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function requireUser(): Promise<MockUser | NextResponse> {
  const user = await currentUser();
  if (!user) return error("Not signed in", 401);
  return user;
}
