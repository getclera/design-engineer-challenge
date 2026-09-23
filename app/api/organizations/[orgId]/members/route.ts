import { json, requireUser } from "@mock/http";
import { USERS } from "@mock/users";

export async function GET() {
  const user = await requireUser();
  if (user instanceof Response) return user;
  return json({
    members: USERS.map((member) => ({
      id: member.profileId,
      role: member.orgRole,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
    })),
  });
}
