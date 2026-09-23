export { isValidLinkedInUrl, normalizeLinkedInUrl } from "@clera/shared-utils";

interface DateCalculation {
	years: number;
	months: number;
	totalMonths: number;
	isShortTerm: boolean;
	formatted: string;
}

interface EmploymentStatus {
	status: string;
	isContract: boolean;
}

export function calculateDateDuration(startDate: string, endDate?: string | null): DateCalculation {
	const start = new Date(startDate);
	const end = endDate ? new Date(endDate) : new Date();

	const totalMonths = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));

	const years = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365));

	const months = Math.floor(
		((end.getTime() - start.getTime()) % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30),
	);

	let formatted = "< 1m";
	if (years > 0 && months > 0) {
		formatted = `${years}y ${months}m`;
	} else if (years > 0) {
		formatted = `${years}y`;
	} else if (months > 0) {
		formatted = `${months}m`;
	}

	return {
		years,
		months,
		totalMonths,
		isShortTerm: totalMonths < 12,
		formatted,
	};
}

export function extractEmploymentStatus(subtitle?: string): EmploymentStatus | null {
	if (!subtitle) return null;

	const status = subtitle.split(" · ")[1];
	if (!status) return null;

	return {
		status,
		isContract: status.toLowerCase().includes("contract"),
	};
}

export function getDurationBadgeClasses(isShortTerm: boolean): string {
	return isShortTerm
		? "bg-red-50 text-red-700 border border-red-200"
		: "bg-blue-50 text-blue-700 border border-blue-200";
}

export function getEmploymentStatusClasses(isContract: boolean, isInTooltip = false): string {
	if (isContract) {
		return "bg-red-100 text-red-700 border border-red-200";
	}
	return isInTooltip ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-gray-100 text-gray-700";
}

export function cleanDateRange(dateRange: string): string {
	return dateRange
		.replace(/\s*[·•]\s*.*$/, "")
		.replace(/\s*\([^)]*\)\s*$/, "")
		.trim();
}

export function calculateTotalYears(items: any[], startField: string, endField: string): string {
	return items
		.reduce((total, item) => {
			if (!item[startField]) return total;

			const startDate = new Date(item[startField]);
			const endDate = item[endField] ? new Date(item[endField]) : new Date();
			const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
			return total + years;
		}, 0)
		.toFixed(1);
}

export function getUniversityRankingBadge(tagId: number): string | null {
	const TAG_ID_TO_NAME: Record<number, string> = {
		6: "Top 10",
		7: "Top 20",
		8: "Top 50",
		9: "Top 100",
	};
	return TAG_ID_TO_NAME[tagId] || null;
}

export function getBestTagId(tags?: number[]): number | undefined {
	if (!tags || tags.length === 0) return undefined;
	return [...tags].sort((a, b) => a - b)[0];
}

export function getFundingStageStyle(stage: string): string {
	const stageType = stage.toLowerCase();

	if (
		stageType.includes("angel") ||
		stageType.includes("pre-seed") ||
		stageType.includes("seed") ||
		stageType.includes("convertible")
	) {
		return "bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs px-2 py-1";
	}
	if (stageType.includes("series") && (stageType.includes("a") || stageType.includes("b") || stageType.includes("c"))) {
		return "bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs px-2 py-1";
	}
	if (
		stageType.includes("series") &&
		(stageType.includes("d") || stageType.includes("e") || stageType.includes("f") || stageType.includes("g"))
	) {
		return "bg-gradient-to-r from-purple-600 to-violet-500 text-white text-xs px-2 py-1";
	}
	if (stageType.includes("private equity")) {
		return "bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs px-2 py-1";
	}
	return "bg-gradient-to-r from-gray-600 to-slate-500 text-white text-xs px-2 py-1";
}

export function isValidFundingStage(stage: string | undefined, validStages: string[]): boolean {
	return stage ? validStages.includes(stage) : false;
}

interface TooltipContent {
	name: string;
	statusBadge?: {
		text: string;
		className: string;
	} | null;
	oneLiner?: string | null;
	rankingBadge?: string | null;
}

export function generateCompanyTooltip(experience: any): TooltipContent {
	const empStatus = extractEmploymentStatus(experience.subtitle);

	return {
		name: experience.companies?.name || experience.company_name || "Company",
		statusBadge: empStatus
			? {
					text: empStatus.status,
					className: getEmploymentStatusClasses(empStatus.isContract, true),
				}
			: null,
		oneLiner: experience.companies?.one_liner || null,
		rankingBadge: null,
	};
}

export function generateSchoolTooltip(education: any): TooltipContent {
	const bestTagId = getBestTagId(education.schools?.tags);
	const rankingBadge = bestTagId ? getUniversityRankingBadge(bestTagId) : null;

	return {
		name: education.schools?.name || "School",
		statusBadge: null,
		oneLiner: null,
		rankingBadge,
	};
}

export function createLogoCollection(experiences: any[], education: any[]) {
	const experienceLogos = experiences
		.map((exp) => ({
			url: exp.company_logo_url,
			type: "experience" as const,
			data: exp,
		}))
		.filter((item) => item.url);

	const educationLogos = education
		.map((edu) => ({
			url: edu.schools?.logo_src,
			type: "education" as const,
			data: edu,
		}))
		.filter((item) => item.url);

	const allLogos = [...experienceLogos, ...educationLogos];
	const uniqueLogos = allLogos.filter((logo, index, self) => index === self.findIndex((l) => l.url === logo.url));

	return uniqueLogos;
}
