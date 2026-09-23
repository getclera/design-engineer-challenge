import type { OrgTalentProfileBundle } from "@/services/api/org-talents";
import type { EnrichedEducation, EnrichedExperience } from "../stubs/edge-functions/talent-service/data/mergeProfileData";
import { talentUuid } from "./ids";
import { REVIEW_ITEM_SEEDS, type ReviewItemSeed } from "./review-items";

const MISSING_PROFILE_TALENT_IDS = new Set([talentUuid("t26")]);

type Header = OrgTalentProfileBundle["header"];
type Preferences = OrgTalentProfileBundle["preferences"];

function experience(
  title: string,
  companyName: string,
  startDate: string | null,
  endDate: string | null,
  extra: Partial<EnrichedExperience> = {},
): EnrichedExperience {
  return {
    title,
    companyName,
    dateRange: null,
    startDate,
    endDate,
    isCurrent: endDate === null && startDate !== null,
    employmentType: "Full-time",
    location: null,
    description: null,
    descriptionSource: "linkedin",
    resumeBullets: [],
    linkedinDescription: null,
    companyTags: [],
    sources: ["linkedin"],
    companyLinkedinId: null,
    companyLogoUrl: null,
    companyUrl: null,
    companyOneLiner: null,
    companyWebsite: null,
    companyFundingStage: null,
    companyFundingAmount: null,
    companyEmployeeCount: null,
    companyIndustry: null,
    companyFoundedYear: null,
    companyFollowerCount: null,
    companyEmployeeCountRange: null,
    ...extra,
  };
}

function education(schoolName: string, schoolLogoUrl: string | null): EnrichedEducation {
  return {
    schoolName,
    degree: "Master of Science",
    degreeType: "masters",
    fieldOfStudy: "Computer Science",
    dateRange: null,
    startDate: "2013-10",
    endDate: "2018-07",
    isCurrent: false,
    description: null,
    descriptionSource: "linkedin",
    gpaScore: null,
    majors: [],
    minors: [],
    schoolTags: [],
    sources: ["linkedin"],
    schoolLogoUrl,
    schoolUrl: null,
    schoolTagIds: null,
    schoolPrimaryLocation: null,
    schoolFoundedYear: null,
    schoolCategories: [],
  };
}

function skill(name: string) {
  return {
    name,
    normalized: name.toLowerCase(),
    endorsements: null,
    monthsExperience: null,
    skillType: null,
    source: "linkedin" as const,
    sources: ["linkedin" as const],
  };
}

function titleFromHeadline(headline: string | null): string | null {
  if (!headline) return null;
  return headline.replace(/\*/g, "").split(" at ")[0].split(" · ")[0].split(" @ ")[0];
}

function experiencesFromSeed(seed: ReviewItemSeed): EnrichedExperience[] {
  const currentTitle = titleFromHeadline(seed.headline) ?? "Software Engineer";
  let year = 2025;
  return seed.companies.map((company, index) => {
    const span = 2 + (index % 3);
    const start = `${year - span}-0${1 + (index % 8)}`;
    const end = index === 0 ? null : `${year}-06`;
    year -= span;
    return experience(index === 0 ? currentTitle : "Software Engineer", company.name, start, end, {
      companyLogoUrl: company.logoUrl,
      location: index % 2 === 0 ? "Berlin, Germany" : "Remote",
      description:
        index === 0
          ? "Owns a core system end to end. Hires for it, reviews it, and carries the pager for it."
          : "Shipped product features across the stack in a small team.",
    });
  });
}

function basePreferences(): Preferences {
  return {
    roles: ["Backend Engineer"],
    jobTypes: ["Full-Time"],
    workEnvironment: ["hybrid"],
    locations: ["Berlin"],
    targetLocations: [{ label: "Berlin, Germany", lat: 52.52, lng: 13.405, radius: 50 }],
    visaSponsorshipNeeded: false,
    visaSponsorshipType: [],
    visaSponsorshipFurtherDetails: null,
    willingnessToRelocate: ["Within my country"],
    salaryLowerBound: 85000,
    salaryUpperBound: 110000,
    salaryCurrency: "EUR",
    salaryImportance: null,
    companySize: [],
    companyStage: ["Seed", "Series A"],
    industries: [],
    blockedCompanies: [],
    preferredJobComment: null,
    visaDetails: null,
    openToOpportunities: true,
  };
}

function baseHeader(seed: ReviewItemSeed): Header {
  const [firstname, ...rest] = seed.talentName.split(" ");
  return {
    id: seed.talentId,
    firstname,
    lastname: rest.length ? rest.join(" ") : null,
    fullName: seed.talentName,
    email: null,
    phone: null,
    linkedinUrl: `https://www.linkedin.com/in/example-${seed.talentId.slice(-4)}`,
    portfolioUrl: null,
    githubUrl: `https://github.com/example-${seed.talentId.slice(-4)}`,
    xUrl: null,
    avatarUrl: seed.talentAvatarUrl,
    occupation: titleFromHeadline(seed.headline),
    location: "Berlin, Germany",
    yearsExperience: Math.max(1, seed.companies.length * 2),
    jobSearchStatus: seed.bucket === "intro_request" ? "active" : "passive",
    availableStartDate: null,
    resumePath: null,
    oneLiner: seed.talentOneliner,
    resumeScope: null,
    talentTags: [],
  };
}

type Override = {
  header?: Partial<Header>;
  experiences?: EnrichedExperience[];
  education?: EnrichedEducation[];
  skills?: string[];
  languages?: { name: string; proficiency: string | null }[];
  preferences?: Partial<Preferences>;
};

const OVERRIDES: Record<string, Override> = {
  t05: {
    header: { location: "London, United Kingdom" },
    languages: [
      { name: "Mandarin", proficiency: "Native or bilingual" },
      { name: "English", proficiency: "Full professional" },
    ],
    preferences: {
      locations: ["London"],
      salaryLowerBound: 140000,
      salaryUpperBound: 180000,
      salaryCurrency: "GBP",
      visaSponsorshipNeeded: true,
      visaSponsorshipType: ["UK Skilled Worker"],
      visaDetails: "Needs UK Skilled Worker sponsorship",
    },
  },
  t07: {
    header: { occupation: null, location: null, yearsExperience: null, githubUrl: null, jobSearchStatus: null },
    skills: [],
    languages: [],
    education: [],
    preferences: {
      roles: [],
      locations: [],
      targetLocations: [],
      salaryLowerBound: null,
      salaryUpperBound: null,
      openToOpportunities: null,
    },
  },
  t22: {
    header: { location: "Lisbon, Portugal", yearsExperience: 20, availableStartDate: "2026-12-01" },
    experiences: [
      experience("Principal Engineer", "Halcyon Bank", "2022-03", null, { description: "Technical lead for the core banking ledger." }),
      experience("Staff Engineer", "Halcyon Bank", "2020-01", "2022-03"),
      experience("Engineering Manager", "Kestrel Pay", "2018-06", "2020-01"),
      experience("Senior Engineer", "Kestrel Pay", "2017-02", "2018-06"),
      experience("Tech Lead", "Cobalt Freight", "2015-09", "2017-02"),
      experience("Senior Engineer", "Cobalt Freight", "2014-01", "2015-09"),
      experience("Software Engineer", "Pinecrest Analytics", "2012-10", "2014-01"),
      experience("Software Engineer", "Sundial Energy", "2011-05", "2012-10"),
      experience("Contractor", "Self-employed", "2010-09", "2011-05", { employmentType: "Freelance" }),
      experience("Software Engineer", "Mosaic Health", "2009-01", "2010-09"),
      experience("Junior Developer", "Orbitly", "2008-02", "2009-01"),
      experience("Developer", "Vantle", "2007-01", "2008-02"),
      experience("Intern", "Fernhill Robotics", "2006-06", "2006-12", { employmentType: "Internship" }),
      experience("Teaching Assistant", "EPFL", "2005-09", "2006-06", { employmentType: "Part-time" }),
      experience("Research Assistant", "EPFL", "2004-09", "2005-06", { employmentType: "Part-time" }),
    ],
  },
  t23: {
    header: {
      occupation: null,
      location: "Munich, Germany",
      yearsExperience: 0,
      linkedinUrl: null,
      githubUrl: null,
      portfolioUrl: "https://example.com/lukas-portfolio",
    },
    experiences: [],
    preferences: { roles: ["Product Designer"], salaryLowerBound: null, salaryUpperBound: null },
  },
  t24: {
    experiences: [
      experience("Staff ML Engineer", "Pinecrest Analytics", "2022-01", null, { description: "Leads the forecasting platform." }),
      experience("Founder", "Raman ML", "2023-05", null, { description: "Consultancy, 2–3 clients at a time.", employmentType: "Self-employed" }),
      experience("Advisor", "Stealth Startup", null, null, { isCurrent: true }),
      experience("Senior ML Engineer", "Driftwood AI", "2019-03", "2022-04"),
      experience("ML Engineer", "Driftwood AI", "2017-09", null, { isCurrent: false }),
    ],
  },
  t25: {
    header: {
      jobSearchStatus: "not_looking",
      linkedinUrl: "linkedin.com/in/",
      githubUrl: "not provided",
      portfolioUrl: "htp://noah-becker",
    },
  },
};

function buildProfile(seed: ReviewItemSeed): OrgTalentProfileBundle {
  const key = `t${seed.talentId.slice(-2)}`;
  const override = OVERRIDES[key] ?? {};
  return {
    header: { ...baseHeader(seed), ...override.header },
    mergedProfile: {
      experiences: override.experiences ?? experiencesFromSeed(seed),
      education: override.education ?? (seed.school ? [education(seed.school.name, seed.school.logoUrl)] : []),
      skills: (override.skills ?? ["TypeScript", "Go", "PostgreSQL", "Kubernetes", "System design"].slice(0, 2 + (seed.talentId.charCodeAt(35) % 4))).map(skill),
      languages: (override.languages ?? [{ name: "English", proficiency: "Full professional" }]).map((language) => ({
        ...language,
        source: "linkedin" as const,
        sources: ["linkedin" as const],
      })),
      certifications: [],
    },
    preferences: { ...basePreferences(), ...override.preferences },
  };
}

export const PROFILES: Record<string, OrgTalentProfileBundle> = Object.fromEntries(
  REVIEW_ITEM_SEEDS.filter((seed) => !MISSING_PROFILE_TALENT_IDS.has(seed.talentId)).map((seed) => [seed.talentId, buildProfile(seed)]),
);
