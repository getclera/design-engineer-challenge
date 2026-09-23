export type ReviewSource = "intro_request" | "drop_list" | "submitted" | "drop" | "passed";
export type ReviewBucket = "intro_request" | "role_specific" | "weekly_drop" | "public_drop";

export interface ReviewChip {
  name: string;
  logoUrl: string | null;
}

export interface ReviewItem {
  talentId: string;
  talentName: string;
  talentOneliner: string | null;
  talentAvatarUrl: string | null;
  roleId: string | null;
  roleName: string | null;
  opportunityId: number;
  source: ReviewSource;
  bucket: ReviewBucket;
  headline: string | null;
  fitReason: string | null;
  receivedAt: string | null;
  companies: ReviewChip[];
  school: ReviewChip | null;
}

export interface ReviewBucketCounts {
  all: number;
  intro_request: number;
  role_specific: number;
  weekly_drop: number;
  public_drop: number;
}

export interface RoleReviewCounts {
  pending: number;
  truncated: boolean;
}

export interface ReviewListData {
  items: ReviewItem[];
  totalCount: number;
  truncated: boolean;
  counts: ReviewBucketCounts;
  byRole: Record<string, RoleReviewCounts>;
  pausedPending: Record<string, number>;
}

export interface Role {
  id: string;
  name: string;
  location: string;
  status: "open" | "paused";
}

export type JobSearchStatus = "actively_looking" | "open_to_offers" | "not_looking" | null;

export interface Experience {
  title: string;
  company: string;
  companyLogoUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  location: string | null;
}

export interface Education {
  school: string;
  degree: string | null;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
}

export interface TalentProfile {
  talentId: string;
  header: {
    fullName: string;
    occupation: string | null;
    location: string | null;
    yearsExperience: number | null;
    jobSearchStatus: JobSearchStatus;
    availableStartDate: string | null;
    avatarUrl: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    portfolioUrl: string | null;
  };
  experiences: Experience[];
  education: Education[];
  skills: string[];
  languages: { language: string; proficiency: string | null }[];
  preferences: {
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string | null;
    remotePreference: "remote" | "hybrid" | "onsite" | null;
    preferredLocations: string[];
    visaDetails: string | null;
    openToOpportunities: boolean | null;
  };
}

export type ReviewAction = "request_intro" | "pass";

export interface ReviewActionRequest {
  talentId: string;
  jobId: string | null;
  action: ReviewAction;
  noFitCategories?: string[];
  interestCompanyCategory?: string;
  text?: string;
}
