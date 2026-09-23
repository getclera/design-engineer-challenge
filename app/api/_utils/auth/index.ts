import type { AppOrgRole } from "@clera/auth";
import { ORG_ID } from "@mock/ids";
import { currentUser } from "@mock/store";

export type OrgRole = AppOrgRole;

export type OrgAuthResult =
  | { success: true; userId: string; email: string; isAdmin: boolean; orgRole?: OrgRole }
  | { success: false; statusCode: number; error: string };

export async function requireOrgAccess(orgId: string): Promise<OrgAuthResult> {
  const user = await currentUser();
  if (!user) return { success: false, statusCode: 401, error: "Not signed in" };
  if (orgId !== ORG_ID) return { success: false, statusCode: 404, error: "Organization not found" };
  return { success: true, userId: user.profileId, email: user.email, isAdmin: false, orgRole: user.orgRole };
}
