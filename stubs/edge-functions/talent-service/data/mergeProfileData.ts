import type {
  MergedCertification,
  MergedEducation,
  MergedExperience,
  MergedLanguage,
  MergedSkill,
} from "../../../../packages/shared-utils/src/talent-merge/types";

export interface EmployeeCountRange {
  min: number | null;
  max: number | null;
}

export interface EnrichedExperience extends MergedExperience {
  companyLinkedinId: number | null;
  companyLogoUrl: string | null;
  companyUrl: string | null;
  companyOneLiner: string | null;
  companyWebsite: string | null;
  companyFundingStage: string | null;
  companyFundingAmount: string | null;
  companyEmployeeCount: number | null;
  companyIndustry: string | null;
  companyFoundedYear: number | null;
  companyFollowerCount: number | null;
  companyEmployeeCountRange: EmployeeCountRange | null;
}

export interface EnrichedEducation extends MergedEducation {
  schoolLogoUrl: string | null;
  schoolUrl: string | null;
  schoolTagIds: number[] | null;
  schoolPrimaryLocation: string | null;
  schoolFoundedYear: number | null;
  schoolCategories: string[];
}

export interface MergedProfileData {
  experiences: EnrichedExperience[];
  education: EnrichedEducation[];
  skills: MergedSkill[];
  languages: MergedLanguage[];
  certifications: MergedCertification[];
  summary: { aiSummary: string | null; resumeSummary: string | null } | null;
}
