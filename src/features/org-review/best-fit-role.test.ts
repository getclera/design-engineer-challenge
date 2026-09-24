import assert from "node:assert/strict";
import { test } from "node:test";
import { bestFitRoleId } from "./best-fit-role.ts";

const roles = [
	{ id: "backend", position: "Founding Backend Engineer" },
	{ id: "design", position: "Senior Product Designer" },
	{ id: "ml", position: "Staff Machine Learning Engineer" },
];

test("picks the role whose distinctive words match", () => {
	assert.equal(bestFitRoleId(roles, ["Strong across backend systems"]), "backend");
	assert.equal(bestFitRoleId(roles, ["Applied scientist", "machine learning at scale"]), "ml");
});

test("ignores words every role shares and returns null without a match", () => {
	assert.equal(bestFitRoleId(roles, ["Senior Software Engineer"]), null);
	assert.equal(bestFitRoleId(roles, [null, undefined]), null);
});
