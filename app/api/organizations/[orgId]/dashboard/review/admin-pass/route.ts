import { error } from "@mock/http";

export async function POST() {
  return error("Platform admins only", 403);
}
