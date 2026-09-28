import type { Organization } from "@/hooks/use-organizations";
import type { ContactOption } from "@/services/api/company-contacts";
import type { CompanyProfile, WebsiteFindings } from "@/features/org-settings/company-profile";
import type { Delivery } from "@/features/org-settings/delivery";
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

// On globalThis so Settings edits survive dev hot reloads. Seeded with four gaps: size, 2 pitch bullets, images, LinkedIn.
const globalCompany = globalThis as unknown as {
  __companyProfile?: CompanyProfile;
  __invitations?: Invitation[];
  __delivery?: Delivery;
};

const PROFILE_SEED: CompanyProfile = {
  name: ORGANIZATION.name,
  logo: ORGANIZATION.logo,
  pitch: "Live tide and port data, so ships stop waiting at sea.",
  building:
    "Ships lose days waiting outside ports for the right tide and a free berth. We turn tide gauges, AIS signals and port schedules into one live feed that tells a captain when to leave, and a port when to expect them.",
  team: "",
  reasons: ["Your code runs in 40 ports in your first month", "", ""],
  size: null,
  industry: "Maritime logistics software",
  stage: "Series A",
  funding: "$18M",
  founded: "2021",
  mode: "Hybrid",
  locations: ["Berlin", "London"],
  benefits: ["30 days off", "Equity for everyone", "€2k learning budget"],
  culture: ["Low ego", "Write it down", "Ship weekly"],
  stack: ["Go", "Postgres", "Kafka", "TypeScript", "Python"],
  teamImages: [],
  productImages: [],
  website: ORGANIZATION.website,
  linkedin: "",
  jobs: "https://jobs.ashbyhq.com/tidewater",
  rounds: [
    { id: "round-a", round: "Series A", amount: "$18M", date: "Mar 2025", investors: "Northzone, Seedcamp", auto: true },
  ],
};

export const COMPANY_PROFILE: CompanyProfile = (globalCompany.__companyProfile ??= structuredClone(PROFILE_SEED));
// A profile kept from before a field existed gets the seed value for it, instead of undefined.
for (const [key, value] of Object.entries(PROFILE_SEED))
  if (!(key in COMPANY_PROFILE)) Object.assign(COMPANY_PROFILE, { [key]: structuredClone(value) });

/**
 * What "Fill from website" finds on tidewater.example (assumed data: there's no real reader behind it).
 * Only empty fields take these.
 */
export const WEBSITE_FINDINGS: WebsiteFindings = {
  team: "22 people across Berlin and London: former port operators, oceanographers and engineers.",
  size: "11–50",
  linkedin: "https://linkedin.com/company/tidewater-labs",
  reasons: ["Work with port operators in 12 countries"],
  productImages: ["/images/tidewater/port-dashboard.svg", "/images/tidewater/tide-feed.svg"],
};

/** Settings › Communications: which updates go where, company-wide. */
export const DELIVERY: Delivery = (globalCompany.__delivery ??= {
  grid: {
    submissions: { slack: false, email: false },
    lists: { slack: false, email: false },
    accepted: { slack: false, email: true },
    booked: { slack: false, email: true },
  },
  slackChannel: null,
  emails: ["robin@tidewater.example"],
  frequency: "now",
});

export interface Invitation {
  id: string;
  email: string;
  role: "owner" | "viewer";
  sentAt: string;
}

export const INVITATIONS: Invitation[] = (globalCompany.__invitations ??= []);
