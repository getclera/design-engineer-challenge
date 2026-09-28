import assert from "node:assert/strict";
import { test } from "node:test";
import { queueSections, sortByQueue, stepNavigable } from "./review-queue.ts";
import type { ReviewItem } from "./types.ts";

const person = (talentId: string, bucket: ReviewItem["bucket"], receivedAt: string | null = null) =>
	({ talentId, roleId: "r", talentName: talentId, bucket, receivedAt }) as ReviewItem;

test("groups people who asked to meet first, then picks, then drops", () => {
	const sorted = sortByQueue([
		person("drop", "weekly_drop"),
		person("pick", "role_specific"),
		person("asked", "intro_request"),
		person("public", "public_drop"),
	]);
	assert.deepEqual(
		sorted.map((i) => i.talentId),
		["asked", "pick", "drop", "public"],
	);
});

test("longest wait first among people who asked; feed order elsewhere", () => {
	const sorted = sortByQueue([
		person("new", "intro_request", "2026-09-20T00:00:00Z"),
		person("pick-b", "role_specific", "2026-01-01T00:00:00Z"),
		person("old", "intro_request", "2026-09-01T00:00:00Z"),
		person("pick-a", "role_specific", "2026-09-25T00:00:00Z"),
	]);
	assert.deepEqual(
		sorted.map((i) => i.talentId),
		["old", "new", "pick-b", "pick-a"],
	);
});

test("sections follow runs, similar picks get their own", () => {
	const items = [person("sim", "weekly_drop"), person("a", "intro_request"), person("b", "role_specific")];
	const sections = queueSections(items, (i) => (i.talentId === "sim" ? "Mara" : undefined));
	assert.deepEqual(
		sections.map((s) => [s.title, s.items.length]),
		[
			["Similar to Mara", 1],
			["Expressed interest", 1],
			["We think it's a match", 1],
		],
	);
});

test("stepNavigable: skips people in closed groups, both ways, null at the ends", () => {
	const items = ["a", "b", "c", "d"];
	const hidden = (x: string) => x === "b" || x === "c";
	assert.equal(stepNavigable(items, 0, 1, hidden), "d");
	assert.equal(stepNavigable(items, 3, -1, hidden), "a");
	assert.equal(stepNavigable(items, 3, 1, hidden), null);
	assert.equal(stepNavigable(items, -1, 1, hidden), "a");
	// Nothing closed: plain next and previous, as before.
	assert.equal(
		stepNavigable(items, 1, 1, () => false),
		"c",
	);
	assert.equal(
		stepNavigable(items, 1, -1, () => false),
		"a",
	);
});
