import assert from "node:assert/strict";
import { test } from "node:test";
import type { ReviewItem } from "@/lib/review-feed";
import { arrivedThisWeek, askedToMeet, deadlineElsewhere, nextSteps } from "./home-summary.ts";

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

test("next steps: fixes ranked by people freed, then review, then setup", () => {
	const steps = nextSteps({
		feed: {
			items: [],
			byRole: { ml: { pending: 11, truncated: false }, be: { pending: 20, truncated: false } },
			pausedPending: { gr: 6 },
		},
		roles: [
			{ id: "ml", position: "ML", status: "active" },
			{ id: "gr", position: "Growth", status: "paused" },
			{ id: "be", position: "Backend", status: "active" },
		],
		readinessFor: (id) =>
			id === "ml" ? { ready: false, reason: "hm_no_link", hmName: "Imogen Vale", hmContactId: "c2" } : { ready: true },
		setup: { profileMissing: ["about"], atsConnected: false },
	});
	assert.deepEqual(
		steps.map((s) => s.kind),
		["calendar", "resume", "review", "profile", "ats"],
	);
	assert.deepEqual(steps[2], { kind: "review", people: 31, minutes: 11 });
});
