import type { OrgRoleRecord } from "../../org-role";

export declare const OrganizationServiceDirect: {
  roles: { list: (input: { orgId: string; includeDeleted?: boolean }) => Promise<OrgRoleRecord[]> };
};
