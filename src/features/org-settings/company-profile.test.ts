import assert from "node:assert/strict";
import { test } from "node:test";
import { type CompanyProfile, companyGaps, looksLikeUrl } from "./company-profile.ts";

const complete: CompanyProfile = {
	name: "Tidewater Labs",
	logo: null,
	pitch: "Live tide data",
	building: "",
	reasons: ["a", "b", "c"],
	size: "11–50",
	stage: null,
	funding: "",
	founded: "",
	mode: null,
	locations: [],
	benefits: [],
	culture: [],
	stack: [],
	website: "",
	linkedin: "linkedin.com/company/tidewater",
	jobs: "",
};

test("companyGaps: nothing missing when size, 3 reasons and LinkedIn are there", () => {
	assert.deepEqual(companyGaps(complete), []);
});

test("companyGaps: lists size, reasons, LinkedIn in that order; blank reasons don't count", () => {
	const gaps = companyGaps({ ...complete, size: null, reasons: ["a", "  ", ""], linkedin: " " });
	assert.deepEqual(
		gaps.map((g) => g.key),
		["size", "reasons", "linkedin"],
	);
	assert.equal(gaps[1].title, "2 more reasons to join");
	assert.equal(companyGaps({ ...complete, reasons: ["a", "b", ""] })[0].title, "1 more reason to join");
});

test("looksLikeUrl: accepts bare domains and paths, rejects words", () => {
	assert.ok(looksLikeUrl("tidewater.example"));
	assert.ok(looksLikeUrl("https://linkedin.com/company/tidewater"));
	assert.ok(!looksLikeUrl("tidewater"));
	assert.ok(!looksLikeUrl("not a url.com"));
});
