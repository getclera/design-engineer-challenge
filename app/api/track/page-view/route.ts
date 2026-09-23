import { json } from "@mock/http";

export async function POST() {
  return json({ ok: true });
}
