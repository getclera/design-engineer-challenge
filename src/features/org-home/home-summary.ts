import type { ReviewItem, ReviewListData } from "@/lib/review-feed";

const DAY_MS = 86_400_000;
/** Same pace Review's scoreboard assumes before it has one of its own. */
const TYPICAL_SECONDS = 20;

interface HomeRole {
	id: string;
	position: string;
	status: string;
}

interface Readiness {
	ready: boolean;
	reason?: "no_hm" | "hm_no_link";
	hmName?: string;
	hmContactId?: string;
}

export interface CompanySetup {
	profileMissing: string[];
	atsConnected: boolean;
}

export type NextStep =
	| { kind: "calendar"; roleId: string; roleName: string; hmName: string; contactId: string; freed: number }
	| { kind: "hiring-manager"; roleId: string; roleName: string; freed: number }
	| { kind: "resume"; roleId: string; roleName: string; freed: number }
	| { kind: "review"; people: number; minutes: number }
	| { kind: "profile"; missing: string[] }
	| { kind: "ats" };

const waitingOn = (item: ReviewItem) => !item.maybe;
const receivedMs = (item: ReviewItem) => (item.receivedAt ? Date.parse(item.receivedAt) : Number.POSITIVE_INFINITY);
const byLongestWait = (a: ReviewItem, b: ReviewItem) => receivedMs(a) - receivedMs(b);

/** People who asked to meet you and still wait for an answer, longest wait first. */
export function askedToMeet(items: ReviewItem[]): ReviewItem[] {
	return items.filter((i) => waitingOn(i) && i.bucket === "intro_request").sort(byLongestWait);
}

/** Didn't ask to meet, but Clera's note says they're on a clock elsewhere ("Why now: …"). */
export function deadlineElsewhere(items: ReviewItem[]): ReviewItem[] {
	return items
		.filter((i) => waitingOn(i) && i.bucket !== "intro_request" && /^\W*why now\b/i.test(i.fitReason ?? ""))
		.sort(byLongestWait);
}

/** Arrived in the last 7 days. A future date (clock skew) counts as just arrived; no date doesn't count. */
export function arrivedThisWeek(items: ReviewItem[], now = Date.now()): ReviewItem[] {
	return items.filter((i) => i.receivedAt && now - Date.parse(i.receivedAt) <= 7 * DAY_MS);
}

/** Everyone waiting on a decision: every active role's queue plus people with no role yet. */
export function waitingTotal(feed: Pick<ReviewListData, "items" | "byRole">): number {
	const inRoles = Object.values(feed.byRole).reduce((sum, r) => sum + r.pending, 0);
	return inRoles + feed.items.filter((i) => waitingOn(i) && !i.roleId).length;
}

/** What needs you, biggest unblock first: role fixes by people they free, then reviewing, then account setup. */
export function nextSteps({
	feed,
	roles,
	readinessFor,
	setup,
}: {
	feed: Pick<ReviewListData, "items" | "byRole" | "pausedPending">;
	roles: HomeRole[];
	readinessFor: (roleId: string) => Readiness;
	setup: CompanySetup;
}): NextStep[] {
	const fixes: Extract<NextStep, { freed: number }>[] = [];
	for (const role of roles) {
		if (role.status === "paused") {
			const freed = feed.pausedPending[role.id] ?? 0;
			if (freed > 0) fixes.push({ kind: "resume", roleId: role.id, roleName: role.position, freed });
			continue;
		}
		const freed = feed.byRole[role.id]?.pending ?? 0;
		const readiness = readinessFor(role.id);
		if (freed === 0 || readiness.ready) continue;
		if (readiness.reason === "hm_no_link" && readiness.hmContactId)
			fixes.push({
				kind: "calendar",
				roleId: role.id,
				roleName: role.position,
				hmName: readiness.hmName ?? "The hiring manager",
				contactId: readiness.hmContactId,
				freed,
			});
		else fixes.push({ kind: "hiring-manager", roleId: role.id, roleName: role.position, freed });
	}
	const steps: NextStep[] = fixes.sort((a, b) => b.freed - a.freed);
	const people = waitingTotal(feed);
	if (people > 0) steps.push({ kind: "review", people, minutes: Math.ceil((people * TYPICAL_SECONDS) / 60) });
	if (setup.profileMissing.length > 0) steps.push({ kind: "profile", missing: setup.profileMissing });
	if (!setup.atsConnected) steps.push({ kind: "ats" });
	return steps;
}
