export const DATA_SOURCES = ["linkedin", "cv", "manual", "github"] as const;
export type DataSource = (typeof DATA_SOURCES)[number];

export interface EntryTags {
	name: string;
	tags: string[];
}

export interface LinkedInExperienceInput {
	title: string | null;
	companyName: string | null;
	linkedinCompanyName?: string | null;
	dateRange: string | null;
	startDate: string | null;
	endDate: string | null;
	isCurrent: boolean | null;
	employmentType: string | null;
	location: string | null;
	description: string | null;
}

export interface LinkedInEducationInput {
	schoolName: string | null;
	degree: string | null;
	fieldOfStudy: string | null;
	dateRange: string | null;
	startDate: string | null;
	endDate: string | null;
	description: string | null;
}

export interface LinkedInSkillInput {
	name: string | null;
	normalizedSkill: string | null;
	endorsements: number | null;
	skillCategory?: string | null;
	isTopSkill?: boolean | null;
}

export interface LinkedInLanguageInput {
	language: string | null;
	proficiency: string | null;
}

export interface CertificationInput {
	title: string | null;
	issuer: string | null;
	issueDate: string | null;
	expirationDate: string | null;
	credentialUrl: string | null;
}

export interface ResumePositionInput {
	jobTitle: string | null;
	employerName: string | null;
	startDate: string | null;
	endDate: string | null;
	isCurrent: boolean | null;
	description: string | null;
	bullets: string[];
}

export interface ResumeEducationInput {
	schoolName: string | null;
	degreeName: string | null;
	degreeType: string | null;
	startDate: string | null;
	endDate: string | null;
	isCurrent: boolean | null;
	gpaScore: string | null;
	majors: string[] | null;
	minors: string[] | null;
}

export interface ResumeSkillInput {
	skillName: string | null;
	normalizedSkill: string | null;
	monthsExperience?: number | null;
	skillType?: string | null;
	lastUsedDate?: string | null;
}

export interface ResumeLanguageInput {
	languageName: string | null;
	proficiencyLevel: string | null;
}

export interface MergedExperience {
	title: string | null;
	companyName: string | null;
	dateRange: string | null;
	startDate: string | null;
	endDate: string | null;
	isCurrent: boolean | null;
	employmentType: string | null;
	location: string | null;
	description: string | null;
	descriptionSource: DataSource;
	resumeBullets: string[];
	linkedinDescription: string | null;
	companyTags: string[];
	sources: DataSource[];
}

export interface MergedEducation {
	schoolName: string | null;
	degree: string | null;
	degreeType?: string | null;
	fieldOfStudy: string | null;
	dateRange: string | null;
	startDate: string | null;
	endDate: string | null;
	isCurrent: boolean | null;
	description: string | null;
	descriptionSource: DataSource;
	gpaScore: string | null;
	majors: string[];
	minors: string[];
	schoolTags: string[];
	sources: DataSource[];
}

export interface MergedSkill {
	name: string;
	normalized: string | null;
	endorsements: number | null;
	monthsExperience: number | null;
	skillType: string | null;
	category?: string | null;
	lastUsedDate?: string | null;
	isTopSkill?: boolean;
	source: DataSource;
	sources: DataSource[];
}

export interface MergedLanguage {
	name: string;
	proficiency: string | null;
	source: DataSource;
	sources: DataSource[];
}

export interface MergedCertification {
	title: string;
	issuer: string | null;
	issueDate: string | null;
	expirationDate: string | null;
	credentialUrl: string | null;
	source: DataSource;
	sources: DataSource[];
}
