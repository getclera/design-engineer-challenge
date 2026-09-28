import { companyKeys } from "@/lib/query-keys";

// Here, not in the client components: the server pages fill these caches too.
export const membersKey = (orgId: string) => companyKeys.membership(orgId);
export const invitationsKey = (orgId: string) => [...companyKeys.membership(orgId), "invitations"] as const;
