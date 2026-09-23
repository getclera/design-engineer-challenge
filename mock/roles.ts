import type { OrgRoleRecord } from "../stubs/org-role";
import { ORGANIZATION } from "./org";
import { ORG_ID, ROLE_IDS } from "./ids";

function role(
  id: string,
  position: string,
  slug: string,
  overrides: Partial<OrgRoleRecord> = {},
): OrgRoleRecord {
  return {
    id,
    position,
    lifecycle: "active",
    status: "active",
    createdAt: "2026-06-10T10:00:00.000Z",
    updatedAt: "2026-09-20T10:00:00.000Z",
    description: null,
    workplaceType: "hybrid",
    slug,
    companyId: ORG_ID,
    companyName: ORGANIZATION.name,
    companySlug: "tidewater-labs",
    companyLogoUrl: ORGANIZATION.logo,
    companyContactId: "c0ffee00-0000-4000-8000-000000000001",
    hiringManagerName: "Robin Keller",
    candidatesInPipeline: 0,
    countries: ["DE"],
    missingFields: [],
    isComplete: true,
    ...overrides,
  };
}

export const ROLES: OrgRoleRecord[] = [
  role(ROLE_IDS.backend, "Founding Backend Engineer", "founding-backend-engineer", { candidatesInPipeline: 4 }),
  role(ROLE_IDS.design, "Senior Product Designer", "senior-product-designer", {
    workplaceType: "remote",
    countries: [],
    candidatesInPipeline: 2,
  }),
  role(ROLE_IDS.ml, "Staff Machine Learning Engineer", "staff-machine-learning-engineer", {
    countries: ["GB"],
    companyContactId: "c0ffee00-0000-4000-8000-000000000002",
    hiringManagerName: "Imogen Vale",
  }),
  role(ROLE_IDS.growth, "Head of Growth", "head-of-growth", { status: "paused", countries: ["NL"] }),
  role(ROLE_IDS.productEng, "Founding Product Engineer", "founding-product-engineer", {
    workplaceType: "onsite",
  }),
];
