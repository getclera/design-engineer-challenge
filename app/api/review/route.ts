import { NextResponse } from "next/server";
import { buildReviewFeed } from "@/data/feed";
import { decisions } from "@/data/store";
import { randomLatency } from "@/lib/latency";

export async function GET(request: Request) {
  await randomLatency(300, 900);
  const roleId = new URL(request.url).searchParams.get("roleId");
  return NextResponse.json(buildReviewFeed({ roleId, decidedKeys: new Set(decisions.keys()) }));
}
