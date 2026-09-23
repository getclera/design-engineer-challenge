import { capitalizeFirst } from "@clera/shared-utils";
import type { LinkItem } from "@/types/profileData";

interface DedupeContext {
	linkedinUrl: string | null;
	portfolioUrl: string | null;
	githubUrl: string | null;
	xUrl: string | null;
}

const NON_WEB_TYPES = new Set(["linkedin", "email", "gmail", "mail", "phone", "tel", "mobile"]);

export function ensureProtocol(url: string): string {
	if (/^https?:\/\//i.test(url)) return url;
	if (/^mailto:|^tel:/i.test(url)) return url;
	return `https://${url}`;
}

const COMPOUND_TYPE_LABELS: Record<string, string> = {
	personalwebsite: "Personal website",
};

export function otherLinkLabel(link: LinkItem): string {
	if (link.type && link.type !== "other") {
		return COMPOUND_TYPE_LABELS[link.type] ?? capitalizeFirst(link.type);
	}
	return extractHost(link.address) || link.address;
}

export function normalizeOtherLinksClient(raw: unknown, ctx: DedupeContext): LinkItem[] {
	if (!Array.isArray(raw)) return [];
	const dedicatedHosts = new Set(
		[ctx.linkedinUrl, ctx.portfolioUrl, ctx.githubUrl]
			.filter((u): u is string => typeof u === "string" && u.length > 0)
			.map(extractHost),
	);
	if (ctx.xUrl) {
		dedicatedHosts.add("x.com");
		dedicatedHosts.add("twitter.com");
	}
	const seenHosts = new Set<string>();
	const out: LinkItem[] = [];
	for (const entry of raw) {
		const parsed = parseEntry(entry);
		if (!parsed) continue;
		if (!isWebLink(parsed.address)) continue;
		if (NON_WEB_TYPES.has(parsed.type)) continue;
		const host = extractHost(parsed.address);
		if (!host || seenHosts.has(host) || dedicatedHosts.has(host)) continue;
		if (host === "linkedin.com") continue;
		seenHosts.add(host);
		out.push(parsed);
	}
	return out;
}

function parseEntry(entry: unknown): LinkItem | null {
	if (entry === null || typeof entry !== "object") return null;
	const type = readString(entry, "type") ?? readString(entry, "Type");
	const address = (readString(entry, "address") ?? readString(entry, "Address"))?.trim();
	if (!address) return null;
	return { type: (type ?? "").trim().toLowerCase() || "other", address };
}

function readString(obj: object, key: string): string | undefined {
	if (!(key in obj)) return undefined;
	const value = (obj as Record<string, unknown>)[key]; // v2-precheck-ignore as-cast
	return typeof value === "string" ? value : undefined;
}

function isWebLink(address: string): boolean {
	if (!address || address.length < 4) return false;
	if (address.includes("@")) return false;
	if (/^(tel:|mailto:)/i.test(address)) return false;
	if (/^\+?[\d\s\-().]+$/.test(address)) return false;
	const stripped = address.replace(/^https?:\/\//i, "");
	return stripped.includes(".");
}

const REDUNDANT_HOSTS: Record<string, readonly string[]> = {
	x: ["x.com"],
	github: ["github.com"],
};

export function hostRepeatsLabel(host: string, label: string): boolean {
	return REDUNDANT_HOSTS[label.toLowerCase()]?.includes(host) ?? false;
}

export function extractHost(address: string): string {
	const withProto = /^https?:\/\//i.test(address) ? address : `https://${address}`;
	try {
		return new URL(withProto).hostname.replace(/^www\./i, "").toLowerCase();
	} catch {
		return "";
	}
}
