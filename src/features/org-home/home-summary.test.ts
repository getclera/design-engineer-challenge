import assert from "node:assert/strict";
import { test } from "node:test";
import type { ReviewItem } from "@/lib/review-feed";
import {
	applyHomeDemo,
	arrivedThisWeek,
	askedToMeet,
	deadlineElsewhere,
	nextSteps,
	stuckIntros,
} from "./home-summary.ts";

const DAY = 86_400_000;
const NOW = Date.parse("2026-09-27T12:00:00Z");
const ago = (days: number) => new Date(NOW - days * DAY).toISOString();
const person = (
	talentId: string,
	bucket: ReviewItem["bucket"],
	receivedAt: string | null,
	extra: Partial<ReviewItem> = {},
) => ({ talentId, roleId: "r", bucket, receivedAt, fitReason: null, ...extra }) as ReviewItem;

test("asked to meet: only intro requests still waiting, longest wait first", () => {
	const items = [
		person("new", "intro_request", ago(0.1)),
		person("old", "intro_request", ago(2)),
		person("parked", "intro_request", ago(5), { maybe: { note: "" } }),
		person("drop", "weekly_drop", ago(9)),
	];
	assert.deepEqual(
		askedToMeet(items).map((i) => i.talentId),
		["old", "new"],
	);
});

test("deadline elsewhere: a why-now note on someone who didn't ask to meet", () => {
	const items = [
		person("clock", "public_drop", ago(6), { fitReason: "Why now: Interviewing this month." }),
		person("asked", "intro_request", ago(1), { fitReason: "Why now: Final rounds elsewhere." }),
		person("plain", "weekly_drop", ago(1), { fitReason: "Strong systems background." }),
	];
	assert.deepEqual(
		deadlineElsewhere(items).map((i) => i.talentId),
		["clock"],
	);
});

test("arrived this week: skips old and undated, counts a future date as just arrived", () => {
	const items = [
		person("today", "weekly_drop", ago(0.2)),
		person("future", "weekly_drop", ago(-0.1)),
		person("old", "weekly_drop", ago(400)),
		person("undated", "weekly_drop", null),
	];
	assert.deepEqual(
		arrivedThisWeek(items, NOW).map((i) => i.talentId),
		["today", "future"],
	);
});

test("next steps: fixes, then people waiting on you, then things for when you have a minute", () => {
	const readinessFor = (id: string) =>
		id === "ml"
			? { ready: false, reason: "hm_no_link" as const, hmName: "Imogen Vale", hmContactId: "c2" }
			: { ready: true };
	const moving = [
		{ key: "e", name: "Elif", roleId: "ml", roleName: "ML", stage: "intro" as const, at: null, next: null },
	];
	const steps = nextSteps({
		feed: {
			items: [],
			byRole: { ml: { pending: 11, truncated: false }, be: { pending: 20, truncated: false } },
			pausedPending: { gr: 6 },
		},
		roles: [
			{ id: "gr", position: "Growth", status: "paused" },
			{ id: "ml", position: "ML", status: "active" },
			{ id: "be", position: "Backend", status: "active" },
		],
		readinessFor,
		setup: { profileMissing: ["about"], atsConnected: false },
		stuck: stuckIntros(moving, readinessFor),
	});
	assert.deepEqual(
		steps.map((s) => s.kind),
		["calendar", "review", "resume", "profile", "ats"],
	);
	// The stuck intro counts toward the fix: 11 waiting + Elif.
	assert.equal(steps[0].kind === "calendar" && steps[0].freed, 12);
	assert.deepEqual(steps[1], { kind: "review", people: 31, minutes: 11, asked: [], urgent: null });
});

test("demo day 1: nobody sent yet, one role, nothing moving", () => {
	const feed = {
		items: [person("a", "intro_request", ago(1))],
		byRole: { be: { pending: 20, truncated: true } },
		pausedPending: { gr: 6 },
		decidedThisWeek: { intro: 2, maybe: 1, pass: 2 },
	} as unknown as Parameters<typeof applyHomeDemo>[1]["feed"];
	const roles = [
		{ id: "be", position: "Backend", status: "active" },
		{ id: "gr", position: "Growth", status: "paused" },
	];
	const day1 = applyHomeDemo("day1", { feed, roles, moving: [] });
	assert.equal(day1.feed.items.length, 0);
	assert.deepEqual(day1.feed.byRole, { be: { pending: 0, truncated: false } });
	assert.equal(day1.roles.length, 1);
	assert.equal(applyHomeDemo(null, { feed, roles, moving: [] }).feed, feed);
});
