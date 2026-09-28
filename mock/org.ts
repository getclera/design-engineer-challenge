import type { Organization } from "@/hooks/use-organizations";
import type { ContactOption } from "@/services/api/company-contacts";
import type { CompanyProfile } from "@/features/org-settings/company-profile";
import { ORG_ID } from "./ids";

export const ORGANIZATION = {
  id: ORG_ID,
  name: "Tidewater Labs",
  logo: "/logos/tidewater.svg",
  website: "https://tidewater.example",
};

export const MY_ORGANIZATIONS = (role: Organization["role"]): Organization[] => [
  {
    organizationId: ORG_ID,
    role,
    joinedAt: "2026-03-02T09:14:00.000Z",
    name: ORGANIZATION.name,
    logo: ORGANIZATION.logo,
    website: ORGANIZATION.website,
  },
];

// On globalThis so a calendar link saved from Home stays saved across dev hot reloads.
const globalContacts = globalThis as unknown as { __activeContacts?: ContactOption[] };

export const ACTIVE_CONTACTS: ContactOption[] = (globalContacts.__activeContacts ??= [
  {
    id: "c0ffee00-0000-4000-8000-000000000001",
    firstName: "Robin",
    lastName: "Keller",
    email: "robin@tidewater.example",
    title: "CTO",
    calendarLink: "https://cal.example/robin",
    isPrimary: true,
    createdAt: "2026-03-02T09:14:00.000Z",
  },
  {
    id: "c0ffee00-0000-4000-8000-000000000002",
    firstName: "Imogen",
    lastName: "Vale",
    email: "imogen@tidewater.example",
    title: "Head of ML",
    calendarLink: null,
    isPrimary: false,
    createdAt: "2026-05-11T13:40:00.000Z",
  },
]);

/**
 * When the next drop lands, and (assumed data) how the search for it is going.
 * Home shows the search numbers only before the first drop, in the day-1 demo.
 */
export const NEXT_DROP = { day: "Monday", size: 20, looked: 1240, shortlisted: 38 };

/** Account setup Home nudges about until it's done. The profile part is worked out from COMPANY_PROFILE. */
export const COMPANY_SETUP = { atsConnected: false };

// On globalThis so Settings edits survive dev hot reloads. Seeded with three gaps: size, 2 reasons, LinkedIn.
const globalCompany = globalThis as unknown as { __companyProfile?: CompanyProfile; __invitations?: Invitation[] };

export const COMPANY_PROFILE: CompanyProfile = (globalCompany.__companyProfile ??= {
  name: ORGANIZATION.name,
  logo: ORGANIZATION.logo,
  pitch: "Live tide and port data, so ships stop waiting at sea.",
  building:
    "Ships lose days waiting outside ports for the right tide and a free berth. We turn tide gauges, AIS signals and port schedules into one live feed that tells a captain when to leave, and a port when to expect them.",
  reasons: ["Your code runs in 40 ports in your first month", "", ""],
  size: null,
  stage: "Series A",
  funding: "$18M",
  founded: "2021",
  mode: "Hybrid",
  locations: ["Berlin", "London"],
  benefits: ["30 days off", "Equity for everyone", "€2k learning budget"],
  culture: ["Low ego", "Write it down", "Ship weekly"],
  stack: ["Go", "Postgres", "Kafka", "TypeScript", "Python"],
  website: ORGANIZATION.website,
  linkedin: "",
  jobs: "https://jobs.ashbyhq.com/tidewater",
});

export interface Invitation {
  id: string;
  email: string;
  role: "owner" | "viewer";
  sentAt: string;
}

export const INVITATIONS: Invitation[] = (globalCompany.__invitations ??= []);
