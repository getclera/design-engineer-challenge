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
	/** Which Settings field "Finish your company profile" opens on. */
	profileFocus?: string;
	atsConnected: boolean;
}

export type PipelineStage = "intro" | "call" | "interviewing" | "offer";

/** Someone you said yes to, and where they are now. */
export interface MovingForwardPerson {
	key: string;
	name: string;
	roleId: string;
	roleName: string;
	stage: PipelineStage;
	/** When it happened (intros, offers) … */
	at: string | null;
	/** … or what's next, when that's more useful ("Thu 14:00"). */
	next: string | null;
}

export type NextStep =
	| { kind: "calendar"; roleId: string; roleName: string; hmName: string; contactId: string; freed: number }
	| { kind: "hiring-manager"; roleId: string; roleName: string; freed: number }
	| { kind: "review"; people: number; minutes: number; asked: ReviewItem[]; urgent: ReviewItem | null }
	| { kind: "resume"; roleId: string; roleName: string; freed: number }
	| { kind: "profile"; missing: string[]; focus?: string }
	| { kind: "ats" };

/** 1 needs a fix · 2 waiting on you · 3 when you have a minute. Simple rules a founder can guess, no weights. */
export const STEP_GROUP: Record<NextStep["kind"], 1 | 2 | 3> = {
	calendar: 1,
	"hiring-manager": 1,
	review: 2,
	resume: 3,
	profile: 3,
	ats: 3,
};

const waitingOn = (item: ReviewItem) => !item.maybe;
const receivedMs = (item: ReviewItem) => (item.receivedAt ? Date.parse(item.receivedAt) : Number.POSITIVE_INFINITY);
const byLongestWait = (a: ReviewItem, b: ReviewItem) => receivedMs(a) - receivedMs(b);
const sizeOf = (step: NextStep) => ("freed" in step ? step.freed : step.kind === "review" ? step.people : 0);

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

export const reviewMinutes = (people: number) => Math.ceil((people * TYPICAL_SECONDS) / 60);

/** Intros already sent that candidates can't book, per role: the scheduling link or hiring manager is missing. */
export function stuckIntros(
	moving: MovingForwardPerson[],
	readinessFor: (roleId: string) => Readiness,
): Record<string, number> {
	const stuck: Record<string, number> = {};
	for (const p of moving)
		if (p.stage === "intro" && !readinessFor(p.roleId).ready) stuck[p.roleId] = (stuck[p.roleId] ?? 0) + 1;
	return stuck;
}

/** What needs you, in three groups: fixes, then people waiting on you, then things for when you have a minute. */
export function nextSteps({
	feed,
	roles,
	readinessFor,
	setup,
	stuck = {},
}: {
	feed: Pick<ReviewListData, "items" | "byRole" | "pausedPending">;
	roles: HomeRole[];
	readinessFor: (roleId: string) => Readiness;
	setup: CompanySetup;
	stuck?: Record<string, number>;
}): NextStep[] {
	const steps: NextStep[] = [];
	for (const role of roles) {
		if (role.status === "paused") {
			const freed = feed.pausedPending[role.id] ?? 0;
			if (freed > 0) steps.push({ kind: "resume", roleId: role.id, roleName: role.position, freed });
			continue;
		}
		const freed = (feed.byRole[role.id]?.pending ?? 0) + (stuck[role.id] ?? 0);
		const readiness = readinessFor(role.id);
		if (freed === 0 || readiness.ready) continue;
		if (readiness.reason === "hm_no_link" && readiness.hmContactId)
			steps.push({
				kind: "calendar",
				roleId: role.id,
				roleName: role.position,
				hmName: readiness.hmName ?? "The hiring manager",
				contactId: readiness.hmContactId,
				freed,
			});
		else steps.push({ kind: "hiring-manager", roleId: role.id, roleName: role.position, freed });
	}
	const people = waitingTotal(feed);
	if (people > 0)
		steps.push({
			kind: "review",
			people,
			minutes: reviewMinutes(people),
			asked: askedToMeet(feed.items),
			urgent: deadlineElsewhere(feed.items)[0] ?? null,
		});
	if (setup.profileMissing.length > 0)
		steps.push({ kind: "profile", missing: setup.profileMissing, focus: setup.profileFocus });
	if (!setup.atsConnected) steps.push({ kind: "ats" });
	// Stable sort: inside a group the bigger number goes first; setup keeps its order.
	return steps.sort((a, b) => STEP_GROUP[a.kind] - STEP_GROUP[b.kind] || sizeOf(b) - sizeOf(a));
}

export type HomeDemo = "day1" | "quiet" | "done";

export const parseHomeDemo = (value: unknown): HomeDemo | null =>
	value === "day1" || value === "quiet" || value === "done" ? value : null;

/**
 * The mock data is always one busy week. `?demo=` shows Home's other moments on top of it:
 * day 1 (nobody sent yet), a quiet week (nobody new), all done (every candidate decided).
 */
export function applyHomeDemo<R extends HomeRole>(
	demo: HomeDemo | null,
	data: { feed: ReviewListData; roles: R[]; moving: MovingForwardPerson[] },
): { feed: ReviewListData; roles: R[]; moving: MovingForwardPerson[]; allReady: boolean } {
	if (!demo) return { ...data, allReady: false };
	const { feed } = data;
	const emptyQueues: ReviewListData["byRole"] = Object.fromEntries(
		Object.keys(feed.byRole).map((id) => [id, { pending: 0, truncated: false }]),
	);
	const decided = feed.decidedThisWeek;
	if (demo === "day1")
		return {
			feed: {
				...feed,
				items: [],
				byRole: emptyQueues,
				pausedPending: {},
				decidedThisWeek: { intro: 0, maybe: 0, pass: 0 },
			},
			roles: data.roles.slice(0, 1).map((r) => ({ ...r, pipelineStages: undefined })),
			moving: [],
			allReady: false,
		};
	return {
		feed: {
			...feed,
			items: feed.items.filter((i) => i.maybe),
			byRole: emptyQueues,
			pausedPending: {},
			// All done: everyone who was waiting got a decision this week.
			decidedThisWeek:
				demo === "done" ? { ...decided, pass: decided.pass + waitingTotal(feed) } : { intro: 0, maybe: 0, pass: 0 },
		},
		roles: data.roles,
		moving: data.moving,
		allReady: true,
	};
}
