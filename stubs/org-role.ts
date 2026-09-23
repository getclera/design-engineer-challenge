export interface OrgRoleRecord {
  id: string;
  position: string;
  lifecycle: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  description: string | null;
  workplaceType: string | null;
  slug: string;
  companyId: string;
  companyName: string;
  companySlug: string | null;
  companyLogoUrl: string | null;
  companyContactId: string | null;
  hiringManagerName: string | null;
  candidatesInPipeline: number;
  countries: string[];
  missingFields: {
    key: "hiring_manager" | "description" | "location" | "salary" | "experience" | "requirements" | "interview_stages";
    label: string;
  }[];
  isComplete: boolean;
}
