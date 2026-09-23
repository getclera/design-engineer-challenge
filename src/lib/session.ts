import { cookies } from "next/headers";
import { USERS, type User } from "@/data/users";

export const SESSION_COOKIE = "review_session";

export async function currentUser(): Promise<User | null> {
  const store = await cookies();
  const userId = store.get(SESSION_COOKIE)?.value;
  return USERS.find((user) => user.id === userId) ?? null;
}
