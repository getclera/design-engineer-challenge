import type { Experience, TalentProfile } from "@/types";
import { REVIEW_ITEM_SEEDS, type ReviewItemSeed } from "./review-items";

const MISSING_PROFILE_TALENT_IDS = new Set(["t26"]);

function exp(
  title: string,
  company: string,
  startDate: string | null,
  endDate: string | null,
  description: string | null = null,
): Experience {
  return {
    title,
    company,
    companyLogoUrl: null,
    startDate,
    endDate,
    isCurrent: endDate === null && startDate !== null,
    description,
    location: null,
  };
}

function titleFromHeadline(headline: string | null): string {
  if (!headline) return "Engineer";
  return headline.split(" at ")[0].replace(/\*/g, "").split(" · ")[0];
}

function experiencesFromSeed(seed: ReviewItemSeed): Experience[] {
  const title = titleFromHeadline(seed.headline);
  let year = 2025;
  return seed.companies.map((company, index) => {
    const span = 2 + (index % 3);
    const end = index === 0 ? null : `${year}-06`;
    const start = `${year - span}-0${1 + (index % 8)}`;
    year -= span;
    return {
      ...exp(index === 0 ? title : "Software Engineer", company.name, start, end),
      companyLogoUrl: company.logoUrl,
      location: index % 2 === 0 ? "Berlin, Germany" : "Remote",
      description:
        index === 0
          ? "Owns a core system end to end. Hires, reviews, and carries the pager for it."
          : "Shipped product features across the stack in a small team.",
    };
  });
}

const OVERRIDES: Record<string, Partial<TalentProfile>> = {
  t05: {
    languages: [
      { language: "Mandarin", proficiency: "Native" },
      { language: "English", proficiency: "Fluent" },
    ],
    preferences: {
      salaryMin: 140000,
      salaryMax: 180000,
      salaryCurrency: "GBP",
      remotePreference: "hybrid",
      preferredLocations: ["London"],
      visaDetails: "Needs UK Skilled Worker sponsorship",
      openToOpportunities: true,
    },
  },
  t07: {
    skills: [],
    languages: [],
    education: [],
    preferences: {
      salaryMin: null,
      salaryMax: null,
      salaryCurrency: null,
      remotePreference: null,
      preferredLocations: [],
      visaDetails: null,
      openToOpportunities: null,
    },
  },
  t22: {
    experiences: [
      exp("Principal Engineer", "Halcyon Bank", "2022-03", null, "Technical lead for the core banking ledger."),
      exp("Staff Engineer", "Halcyon Bank", "2020-01", "2022-03"),
      exp("Engineering Manager", "Kestrel Pay", "2018-06", "2020-01"),
      exp("Senior Engineer", "Kestrel Pay", "2017-02", "2018-06"),
      exp("Tech Lead", "Cobalt Freight", "2015-09", "2017-02"),
      exp("Senior Engineer", "Cobalt Freight", "2014-01", "2015-09"),
      exp("Software Engineer", "Pinecrest Analytics", "2012-10", "2014-01"),
      exp("Software Engineer", "Sundial Energy", "2011-05", "2012-10"),
      exp("Contractor", "Self-employed", "2010-09", "2011-05"),
      exp("Software Engineer", "Mosaic Health", "2009-01", "2010-09"),
      exp("Junior Developer", "Orbitly", "2008-02", "2009-01"),
      exp("Developer", "Vantle", "2007-01", "2008-02"),
      exp("Intern", "Fernhill Robotics", "2006-06", "2006-12"),
      exp("Teaching Assistant", "EPFL", "2005-09", "2006-06"),
      exp("Research Assistant", "EPFL", "2004-09", "2005-06"),
    ],
    header: {
      fullName: "Beatriz Moreno",
      occupation: "Principal Engineer",
      location: "Lisbon, Portugal",
      yearsExperience: 20,
      jobSearchStatus: "open_to_offers",
      availableStartDate: "2026-12-01",
      avatarUrl: "/avatars/t22.svg",
      linkedinUrl: "https://www.linkedin.com/in/example-beatriz-moreno",
      githubUrl: null,
      portfolioUrl: null,
    },
  },
  t23: {
    experiences: [],
    header: {
      fullName: "Lukas Hoffmann",
      occupation: null,
      location: "Munich, Germany",
      yearsExperience: 0,
      jobSearchStatus: "actively_looking",
      availableStartDate: null,
      avatarUrl: "/avatars/t23.svg",
      linkedinUrl: null,
      githubUrl: null,
      portfolioUrl: "https://example.com/lukas-portfolio",
    },
  },
  t24: {
    experiences: [
      exp("Staff ML Engineer", "Pinecrest Analytics", "2022-01", null, "Leads the forecasting platform."),
      exp("Founder", "Raman ML", "2023-05", null, "Consultancy, 2–3 clients at a time."),
      exp("Advisor", "Stealth Startup", null, null),
      exp("Senior ML Engineer", "Driftwood AI", "2019-03", "2022-04"),
      exp("ML Engineer", "Driftwood AI", "2017-09", null),
    ],
  },
  t25: {
    header: {
      fullName: "Noah Becker",
      occupation: "Backend Engineer",
      location: "Hamburg, Germany",
      yearsExperience: 5,
      jobSearchStatus: "not_looking",
      availableStartDate: null,
      avatarUrl: "/avatars/t25.svg",
      linkedinUrl: "linkedin.com/in/",
      githubUrl: "not provided",
      portfolioUrl: "htp://noah-becker",
    },
  },
};

function buildProfile(seed: ReviewItemSeed): TalentProfile {
  const base: TalentProfile = {
    talentId: seed.talentId,
    header: {
      fullName: seed.talentName,
      occupation: titleFromHeadline(seed.headline),
      location: "Berlin, Germany",
      yearsExperience: Math.max(1, seed.companies.length * 2),
      jobSearchStatus: seed.bucket === "intro_request" ? "actively_looking" : "open_to_offers",
      availableStartDate: null,
      avatarUrl: seed.talentAvatarUrl,
      linkedinUrl: `https://www.linkedin.com/in/example-${seed.talentId}`,
      githubUrl: seed.roleId === "role_design" ? null : `https://github.com/example-${seed.talentId}`,
      portfolioUrl: seed.roleId === "role_design" ? `https://example.com/${seed.talentId}` : null,
    },
    experiences: experiencesFromSeed(seed),
    education: seed.school
      ? [{ school: seed.school.name, degree: "MSc", fieldOfStudy: "Computer Science", startYear: 2012, endYear: 2017 }]
      : [],
    skills: ["TypeScript", "Go", "PostgreSQL", "Kubernetes", "System design"].slice(0, 2 + (seed.talentId.charCodeAt(2) % 4)),
    languages: [{ language: "English", proficiency: "Fluent" }],
    preferences: {
      salaryMin: 85000,
      salaryMax: 110000,
      salaryCurrency: "EUR",
      remotePreference: "hybrid",
      preferredLocations: ["Berlin"],
      visaDetails: null,
      openToOpportunities: true,
    },
  };
  return { ...base, ...OVERRIDES[seed.talentId] };
}

export const PROFILES: Record<string, TalentProfile> = Object.fromEntries(
  REVIEW_ITEM_SEEDS.filter((seed) => !MISSING_PROFILE_TALENT_IDS.has(seed.talentId)).map((seed) => [
    seed.talentId,
    buildProfile(seed),
  ]),
);
