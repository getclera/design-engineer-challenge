import { NextResponse } from "next/server";
import { ROLES } from "@/data/roles";

export async function GET() {
  return NextResponse.json(ROLES);
}
