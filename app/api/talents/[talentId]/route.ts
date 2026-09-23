import { NextResponse } from "next/server";
import { PROFILES } from "@/data/profiles";
import { randomLatency } from "@/lib/latency";

export async function GET(_request: Request, { params }: { params: Promise<{ talentId: string }> }) {
  const { talentId } = await params;
  await randomLatency(250, 1200);
  const profile = PROFILES[talentId];
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(profile);
}
