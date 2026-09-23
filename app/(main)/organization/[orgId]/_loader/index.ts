import "server-only";

import { requireOrgAccess } from "@app/api/_utils/auth";
import { authRoutes } from "@clera/route-factory";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { ACTIVE_CONTACTS, MY_ORGANIZATIONS } from "@mock/org";
import { authMeFor } from "@mock/session";
import { currentUser } from "@mock/store";

export const loadOrgShell = cache(async ({ orgId }: { orgId: string }) => {
  const user = await currentUser();
  const access = await requireOrgAccess(orgId);
  if (!access.success && access.statusCode === 401) redirect(authRoutes.loginWithRedirect(`/organization/${orgId}/review`));
  if (!access.success) notFound();

  const viewerOrgRole = access.orgRole ?? null;
  const viewerCanManageContacts = viewerOrgRole === "owner" || viewerOrgRole === "editor";

  return {
    auth: authMeFor(user),
    orgId,
    myOrganizations: MY_ORGANIZATIONS(viewerOrgRole ?? "viewer"),
    viewerOrgRole,
    viewerIsPlatformAdmin: false,
    viewerCanManageContacts,
    activeContactOptions: viewerCanManageContacts ? ACTIVE_CONTACTS : [],
    pendingApproval: false,
    talentSearchEnabled: false,
    canUseTalentSearch: false,
  };
});
