import { json } from "@mock/http";

export async function GET() {
  return json({ accepted: true });
}

export async function POST() {
  return json({ success: true });
}
