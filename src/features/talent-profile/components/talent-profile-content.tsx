"use client";

import { type OrgTalentTracking, TrackOrgTalentView } from "@v2/components/tracking";
import { Card } from "@v2/components/ui/card";
import type { ReactNode } from "react";
import type { OrgTalentProfileBundle } from "@/services/api/org-talents";
import type { MergedProfile } from "@/services/api/talents";
import { EducationCard } from "./tabs/education-card";
import { ExperienceCard } from "./tabs/experience-card";
import { HeaderProfileLinks } from "./tabs/header-profile-links";
import { HeaderResumeButton } from "./tabs/header-resume-button";
import { hasFacts, IdentityFactsRow } from "./tabs/identity-facts-row";
import { type IdentityHeaderData, IdentityPublicZone } from "./tabs/identity-public-zone";
import { LanguagesCard } from "./tabs/languages-card";
import { PreferencesOverviewCard } from "./tabs/preferences-overview-card";
import { ResumeCard } from "./tabs/resume-card";
import { SecondarySectionsCard } from "./tabs/secondary-sections-card";
import { SkillsCard } from "./tabs/skills-card";

type BundleMergedProfile = OrgTalentProfileBundle["mergedProfile"];

function toProfileExperience(exp: BundleMergedProfile["experiences"][number]): MergedProfile["experiences"][number] {
	return {
		title: exp.title,
		company: {
			name: exp.companyName,
			linkedinId: null,
			logoUrl: exp.companyLogoUrl,
			url: exp.companyUrl,
			website: exp.companyWebsite,
			oneLiner: exp.companyOneLiner,
			industry: exp.companyIndustry,
			tags: exp.companyTags,
			categories: [],
			specialities: [],
			primaryLocation: null,
			employeeCount: exp.companyEmployeeCount,
			employeeRange: exp.companyEmployeeCountRange,
			followerCount: exp.companyFollowerCount,
			foundedYear: exp.companyFoundedYear,
			funding: {
				stage: exp.companyFundingStage,
				amount: exp.companyFundingAmount,
				rounds: null,
				lastType: null,
				lastAt: null,
			},
			description: null,
			industries: [],
			country: null,
			operatingStatus: null,
			ipoStatus: null,
			companyType: null,
			crunchbaseUuid: null,
			enriched: false,
		},
		startDate: exp.startDate,
		endDate: exp.endDate,
		isCurrent: exp.isCurrent ?? false,
		employmentType: exp.employmentType,
		months: null,
		location: exp.location,
		description: exp.description,
		descriptionSource: exp.descriptionSource,
		bullets: exp.resumeBullets,
		sources: exp.sources,
	};
}

function toProfileEducation(edu: BundleMergedProfile["education"][number]): MergedProfile["education"][number] {
	return {
		school: {
			name: edu.schoolName,
			logoUrl: edu.schoolLogoUrl,
			url: edu.schoolUrl,
			tags: edu.schoolTags,
			tagIds: edu.schoolTagIds ?? [],
			primaryLocation: edu.schoolPrimaryLocation,
			foundedYear: edu.schoolFoundedYear,
			categories: edu.schoolCategories,
			size: null,
		},
		degree: edu.degree,
		degreeType: edu.degreeType ?? null,
		fieldOfStudy: edu.fieldOfStudy,
		majors: edu.majors,
		minors: edu.minors,
		gpa: edu.gpaScore,
		startDate: edu.startDate,
		endDate: edu.endDate,
		isCurrent: edu.isCurrent ?? false,
		description: edu.description,
		descriptionSource: edu.descriptionSource,
		sources: edu.sources,
	};
}

function toProfileSkill(skill: BundleMergedProfile["skills"][number]): MergedProfile["skills"][number] {
	return {
		name: skill.name,
		normalized: skill.normalized,
		endorsements: skill.endorsements,
		monthsExperience: skill.monthsExperience,
		skillType: skill.skillType,
		category: skill.category ?? null,
		lastUsedDate: skill.lastUsedDate ?? null,
		isTopSkill: skill.isTopSkill ?? false,
		sources: skill.sources,
	};
}

function toProfileLanguage(lang: BundleMergedProfile["languages"][number]): MergedProfile["languages"][number] {
	return { name: lang.name, proficiency: lang.proficiency, sources: lang.sources };
}

interface TalentProfileContentProps {
	bundle: OrgTalentProfileBundle;
	displayNameOverride?: string | null;
	occupationOverride?: string | null;
	identiconSeed?: string | null;
	tracking?: OrgTalentTracking;
	aboveHeader?: ReactNode;
	belowFacts?: ReactNode;
}

function TalentProfileContent({
	bundle,
	displayNameOverride,
	occupationOverride,
	identiconSeed,
	tracking,
	aboveHeader,
	belowFacts,
}: TalentProfileContentProps) {
	const { header, mergedProfile, preferences } = bundle;

	const headerData: IdentityHeaderData = {
		firstname: header.firstname,
		lastname: header.lastname,
		occupation: header.occupation,
		location: header.location,
		avatarUrl: header.avatarUrl,
		openForOpportunities: preferences.openToOpportunities ?? null,
		linkedinUrl: header.linkedinUrl,
		portfolioUrl: header.portfolioUrl,
		githubUrl: header.githubUrl,
		xUrl: header.xUrl,
		otherLinks: [],
	};

	const factsProps = { preferences };

	return (
		<div className="mx-auto flex w-full max-w-230 flex-col gap-1.75 px-4 py-3 sm:px-6 sm:py-4">
			{tracking && <TrackOrgTalentView tracking={tracking} />}
			{aboveHeader && <div className="flex items-center px-1">{aboveHeader}</div>}
			<Card variant="flat" className="overflow-hidden">
				<div className="px-4 py-2 sm:px-5 sm:py-2.5">
					<IdentityPublicZone
						data={headerData}
						displayNameOverride={displayNameOverride}
						occupationOverride={occupationOverride}
						identiconSeed={identiconSeed}
						talentTags={header.talentTags}
						headerActions={
							<div className="flex flex-col items-end gap-1.5">
								<HeaderResumeButton talentId={header.id} scope={header.resumeScope} />
								<HeaderProfileLinks
									githubUrl={header.githubUrl}
									xUrl={header.xUrl}
									portfolioUrl={header.portfolioUrl}
								/>
							</div>
						}
						linkedinTracking={tracking}
					/>
				</div>
				{hasFacts(factsProps) && (
					<div className="border-t border-v2-border-warm/50 px-4 py-1.5 sm:px-5">
						<IdentityFactsRow {...factsProps} />
					</div>
				)}
				{belowFacts}
			</Card>

			<ExperienceCard
				talentId={header.id}
				experiences={mergedProfile.experiences.map(toProfileExperience)}
				yearsExperience={header.yearsExperience}
				showYoeInternals={false}
				showRecalculate={false}
			/>

			<EducationCard education={mergedProfile.education.map(toProfileEducation)} />

			<PreferencesOverviewCard data={preferences} visaDetails={preferences.visaDetails} />

			<ResumeCard talentId={header.id} scope={header.resumeScope} />

			<SkillsCard skills={mergedProfile.skills.map(toProfileSkill)} />

			<LanguagesCard languages={mergedProfile.languages.map(toProfileLanguage)} />

			<SecondarySectionsCard certifications={mergedProfile.certifications} />
		</div>
	);
}
TalentProfileContent.displayName = "TalentProfileContent";

export { TalentProfileContent };
