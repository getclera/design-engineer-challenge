export interface CompanyContactRow {
  id: string;
  companyId: string;
  userId: string | null;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  linkedinUrl: string | null;
  title: string | null;
  calendarLink: string | null;
  isPrimary: boolean;
  shouldCc: boolean;
  verifiedAt: string | null;
  deactivatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobInterviewStageRow {
  id: string;
  jobId: string;
  name: string;
  description: string | null;
  duration: string | null;
  priority: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  adminId: string | null;
  isDeleted: boolean;
}

export interface YoeRunRow {
  id: string;
  talentId: string;
  yearsExperience: number;
  reasoning: string | null;
  source: string;
  computedAt: string;
}
