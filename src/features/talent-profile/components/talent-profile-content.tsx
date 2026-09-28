"use client";

import { usableProfileLink } from "@clera/shared-utils";
import { type OrgTalentTracking, TrackOrgTalentView } from "@v2/components/tracking";
import { Card } from "@v2/components/ui/card";
import { cn } from "@v2/lib/utils";
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
	/** Under name, headline and location (Review: past companies). */
	belowHeader?: ReactNode;
	belowFacts?: ReactNode;
	/** Only the identity card (header, facts, belowFacts); the review deck's card front. */
	compact?: boolean;
	/** Narrows the column (the review deck keeps the profile at 700px). */
	className?: string;
	/** No box around the identity block: its parent is already the card (Review with the list hidden). */
	unboxed?: boolean;
}

function TalentProfileContent({
	bundle,
	displayNameOverride,
	occupationOverride,
	identiconSeed,
	tracking,
	aboveHeader,
	belowHeader,
	belowFacts,
	compact = false,
	className,
	unboxed = false,
}: TalentProfileContentProps) {
	const { header, mergedProfile, preferences } = bundle;
	// Profile data can hold "not provided" or "htp://…": such links would only open an error, so they're not shown.
	const links = {
		linkedinUrl: usableProfileLink(header.linkedinUrl),
		portfolioUrl: usableProfileLink(header.portfolioUrl),
		githubUrl: usableProfileLink(header.githubUrl),
		xUrl: usableProfileLink(header.xUrl),
	};

	const headerData: IdentityHeaderData = {
		firstname: header.firstname,
		lastname: header.lastname,
		occupation: header.occupation,
		location: header.location,
		avatarUrl: header.avatarUrl,
		openForOpportunities: preferences.openToOpportunities ?? null,
		...links,
		otherLinks: [],
	};

	const factsProps = { preferences };
	const identity = (
		<>
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
							<HeaderProfileLinks githubUrl={links.githubUrl} xUrl={links.xUrl} portfolioUrl={links.portfolioUrl} />
						</div>
					}
					linkedinTracking={tracking}
				/>
				{belowHeader}
			</div>
			{hasFacts(factsProps) && (
				<div className="border-t border-v2-border-warm/50 px-4 py-1.5 sm:px-5">
					<IdentityFactsRow {...factsProps} />
				</div>
			)}
			{belowFacts}
		</>
	);

	const sections = (
		<>
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
		</>
	);

	return (
		<div
			className={cn(
				"mx-auto flex w-full max-w-230 flex-col gap-1.75 px-4 py-3 sm:px-6 sm:py-4",
				className,
				unboxed && "gap-0 p-0 sm:p-0",
			)}
		>
			{tracking && <TrackOrgTalentView tracking={tracking} />}
			{aboveHeader && (
				<div className={cn("flex items-center px-1", unboxed && "px-4 pt-3 sm:px-5 sm:pt-3.5")}>{aboveHeader}</div>
			)}
			{unboxed ? (
				<div>{identity}</div>
			) : (
				<Card variant="flat" className="overflow-hidden">
					{identity}
				</Card>
			)}

			{!compact &&
				(unboxed ? (
					<div className="flex flex-col gap-1.75 border-t border-v2-border-warm/50 p-4 sm:p-5">{sections}</div>
				) : (
					sections
				))}
		</div>
	);
}
TalentProfileContent.displayName = "TalentProfileContent";

export { TalentProfileContent };
