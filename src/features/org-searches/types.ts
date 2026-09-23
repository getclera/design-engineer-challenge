import type { StatusTone } from "@v2/components/data-display";

export interface SearchSessionItem {
	id: string;
	jobId: string;
	roleName: string | null;
	status: string;
	totalTalentsEvaluated: number;
	totalMatchesFound: number;
	filters: Record<string, unknown> | null;
	createdAt: string;
	updatedAt: string;
	createdByName: string | null;
}

export interface SearchesListData {
	items: SearchSessionItem[];
	totalCount: number;
}

export interface SearchStatusBadge {
	label: string;
	tone: StatusTone;
}

export function isActiveSearch(status: string): boolean {
	return status === "processing" || status === "initializing";
}

export function getSearchStatusBadge(status: string): SearchStatusBadge {
	switch (status) {
		case "completed":
		case "ready_for_next":
			return { label: "Completed", tone: "active" };
		case "processing":
			return { label: "Processing", tone: "info" };
		case "initializing":
			return { label: "Starting", tone: "warning" };
		case "failed":
			return { label: "Failed", tone: "error" };
		default:
			return { label: status || "Unknown", tone: "neutral" };
	}
}

export function formatSearchFilters(filters: Record<string, unknown> | null): string | null {
	if (!filters) return null;
	const parts: string[] = [];
	if (Array.isArray(filters.location) && filters.location.length > 0) {
		parts.push((filters.location as string[]).slice(0, 2).join(", "));
	}
	if (Array.isArray(filters.skills) && filters.skills.length > 0) {
		parts.push(`${filters.skills.length} skill${filters.skills.length === 1 ? "" : "s"}`);
	}
	if (typeof filters.search_term === "string" && filters.search_term) {
		parts.push(`"${filters.search_term}"`);
	}
	return parts.length > 0 ? parts.join(" · ") : null;
}
