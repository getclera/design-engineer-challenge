import { capitalizeFirst } from "@clera/shared-utils";
import type { OrganizationServiceDirect } from "@edge-functions/organization-service/service";
import type { StatusTone } from "@v2/components/data-display";

export type OrgRole = Awaited<ReturnType<typeof OrganizationServiceDirect.roles.list>>[number];

export type RoleStatus = "active" | "paused" | "draft" | "deleted" | "external" | "hidden";

export interface RoleStatusOption {
	value: Extract<RoleStatus, "active" | "paused" | "draft">;
	label: string;
}

export const ROLE_STATUS_OPTIONS: RoleStatusOption[] = [
	{ value: "active", label: "Active" },
	{ value: "paused", label: "Paused" },
	{ value: "draft", label: "Draft" },
];

export const STATUS_TRIGGER_CLASSES: Record<RoleStatusOption["value"], string> = {
	active: "border-v2-brand-green/20 bg-v2-status-active-bg text-v2-text-brand-green",
	paused: "border-v2-status-info/20 bg-v2-status-info-bg text-v2-status-info",
	draft: "border-v2-status-warning/20 bg-v2-status-warning-bg text-v2-status-warning",
};

const ROLE_STATUS_SORT_RANK: Record<string, number> = {
	active: 0,
	paused: 1,
	draft: 2,
	external: 3,
	deleted: 5,
};

export function sortActiveFirst(roles: OrgRole[]): OrgRole[] {
	return [...roles].sort(
		(a, b) =>
			(ROLE_STATUS_SORT_RANK[(a.status ?? "draft").toLowerCase()] ?? 4) -
			(ROLE_STATUS_SORT_RANK[(b.status ?? "draft").toLowerCase()] ?? 4),
	);
}

export function roleStatusTone(status: string | null | undefined): StatusTone {
	const lower = (status ?? "draft").toLowerCase();
	if (lower === "active") return "active";
	if (lower === "paused") return "info";
	if (lower === "draft") return "warning";
	if (lower === "deleted") return "error";
	return "neutral";
}

export function roleStatusLabel(status: string | null | undefined): string {
	return capitalizeFirst((status ?? "draft").toLowerCase());
}

export function isRoleStatusReadOnly(status: string | null | undefined): boolean {
	const lower = status?.toLowerCase();
	return lower === "external" || lower === "hidden";
}

export function stripHtmlSummary(content: string | null | undefined, maxLength = 80): string {
	if (!content) return "";
	const text = content
		.replace(/<[^>]*>/g, "")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/^\s{0,3}#{1,6}\s+/gm, "")
		.replace(/^\s{0,3}>\s?/gm, "")
		.replace(/^\s*[-*+]\s+/gm, "")
		.replace(/^\s*\d+\.\s+/gm, "")
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/(\*\*|__)(.*?)\1/g, "$2")
		.replace(/(\*|_)(.*?)\1/g, "$2")
		.replace(/`([^`]*)`/g, "$1")
		.replace(/\s+/g, " ")
		.trim();
	return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}
