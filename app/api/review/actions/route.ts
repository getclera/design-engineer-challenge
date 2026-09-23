import { NextResponse } from "next/server";
import { reviewItemKey } from "@/lib/categories";
import { decisions } from "@/data/store";
import { randomLatency } from "@/lib/latency";
import type { ReviewActionRequest } from "@/types";

const FAILURE_RATE = 0.1;

function isActionRequest(body: unknown): body is ReviewActionRequest {
  if (typeof body !== "object" || body === null) return false;
  const { talentId, action, jobId } = body as Record<string, unknown>;
  return (
    typeof talentId === "string" &&
    (action === "request_intro" || action === "pass") &&
    (typeof jobId === "string" || jobId === null)
  );
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  if (!isActionRequest(body)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (body.action === "request_intro" && body.jobId === null) {
    return NextResponse.json({ error: "Pick a role before requesting an intro" }, { status: 422 });
  }

  await randomLatency(400, 1500);
  if (Math.random() < FAILURE_RATE) return NextResponse.json({ error: "Something went wrong" }, { status: 500 });

  decisions.set(reviewItemKey({ talentId: body.talentId, roleId: body.jobId }), {
    action: body.action,
    decidedAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body: unknown = await request.json();
  const { talentId, jobId } = (body ?? {}) as Record<string, unknown>;
  if (typeof talentId !== "string" || !(typeof jobId === "string" || jobId === null)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  await randomLatency(200, 600);
  decisions.delete(reviewItemKey({ talentId, roleId: jobId }));
  return NextResponse.json({ ok: true });
}
