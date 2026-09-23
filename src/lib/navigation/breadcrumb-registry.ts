import type { BreadcrumbItem } from "@v2/components/navigation";

type RouteEntry = {
	pattern: RegExp;
	label: string;
};

const ROUTE_REGISTRY: RouteEntry[] = [
	{ pattern: /^\/v2\/admin$/, label: "Admin" },
	{ pattern: /^\/v2\/admin\/outreach$/, label: "Outreach" },
	{ pattern: /^\/v2\/admin\/outreach\/sixtyfour-searches\/[^/]+$/, label: "Search" },
	{ pattern: /^\/v2\/admin\/outreach\/sixtyfour-searches\/[^/]+\/guidance$/, label: "Guidance" },
	{ pattern: /^\/v2\/admin\/outreach\/sixtyfour-sourcing$/, label: "SixtyFour sourcing" },
	{ pattern: /^\/v2\/admin\/outreach\/campaign-mappings$/, label: "Campaign mappings" },
	{ pattern: /^\/v2\/admin\/outreach\/internal-sessions$/, label: "Internal sessions" },
	{ pattern: /^\/v2\/admin\/outreach\/internal-sessions\/[^/]+$/, label: "Session" },
];

interface BuildOptions {
	leafLabel?: string;
	minDepth?: number;
}

const DEFAULT_MIN_DEPTH = 3;

function labelFor(path: string): string | null {
	for (const entry of ROUTE_REGISTRY) {
		if (entry.pattern.test(path)) return entry.label;
	}
	return null;
}

export function buildBreadcrumbs(pathname: string, options?: BuildOptions): BreadcrumbItem[] | null {
	const segments = pathname.split("?")[0].split("#")[0].split("/").filter(Boolean);
	if (segments.length === 0) return null;

	const items: BreadcrumbItem[] = [];
	for (let i = 0; i < segments.length; i++) {
		const path = `/${segments.slice(0, i + 1).join("/")}`;
		const label = labelFor(path);
		if (!label) continue;
		const isLast = i === segments.length - 1;
		items.push({
			label: isLast && options?.leafLabel ? options.leafLabel : label,
			href: isLast ? undefined : path,
		});
	}

	const minDepth = options?.minDepth ?? DEFAULT_MIN_DEPTH;
	if (items.length < minDepth) return null;
	return items;
}
