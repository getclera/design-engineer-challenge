import assert from "node:assert/strict";
import { test } from "node:test";
import { type CompanyProfile, companyGaps, fillEmpty, looksLikeUrl, sectionState } from "./company-profile.ts";

const complete: CompanyProfile = {
	name: "Tidewater Labs",
	logo: "/logo.svg",
	pitch: "Live tide data",
	building: "One live feed",
	team: "",
	reasons: ["a", "b", "c"],
	size: "11–50",
	industry: "Maritime",
	stage: "Series A",
	funding: "",
	founded: "2021",
	mode: null,
	locations: ["Berlin"],
	benefits: ["Equity"],
	culture: ["Low ego"],
	stack: ["Go"],
	teamImages: ["t.jpg"],
	productImages: ["p.jpg"],
	website: "tidewater.example",
	linkedin: "linkedin.com/company/tidewater",
	jobs: "",
	rounds: [{ id: "r1", round: "Seed", amount: "$3M", date: "", investors: "", auto: false }],
};

test("companyGaps: optional fields (about the team, funding amount, job board) never count", () => {
	assert.deepEqual(companyGaps(complete), []);
});

test("companyGaps: one gap per section, in page order", () => {
	const gaps = companyGaps({ ...complete, size: null, reasons: ["a", "  ", ""], linkedin: "linkedin", teamImages: [] });
	assert.deepEqual(
		gaps.map((g) => g.key),
		["details", "selling", "images", "links"],
	);
	assert.equal(gaps[0].label, "company details");
});

test("sectionState: names what's missing; a half-typed link is missing; one of three bullets is partial", () => {
	assert.deepEqual(sectionState({ ...complete, linkedin: "linkedin" }, "links").missing, ["LinkedIn"]);
	const selling = sectionState({ ...complete, reasons: ["a", "", ""] }, "selling");
	assert.deepEqual(selling.missing, ["2 more pitch bullets"]);
	assert.ok(selling.partial);
	assert.ok(!sectionState({ ...complete, reasons: ["", "", ""] }, "selling").partial);
	assert.ok(!sectionState({ ...complete, teamImages: [], productImages: [] }, "images").partial);
	assert.ok(sectionState({ ...complete, teamImages: [] }, "images").partial);
});

test("fillEmpty: fills blanks only, never overwrites, reasons go into empty slots", () => {
	const filled = fillEmpty(
		{ ...complete, size: null, team: "", linkedin: "", reasons: ["Mine", "", ""], stack: ["Go"] },
		{ size: "11–50", team: "22 people", linkedin: "linkedin.com/x", reasons: ["Theirs"], stack: ["Rust"] },
	);
	assert.deepEqual(filled, {
		size: "11–50",
		team: "22 people",
		linkedin: "linkedin.com/x",
		reasons: ["Mine", "Theirs", ""],
	});
});

test("looksLikeUrl: accepts bare domains and paths, rejects words", () => {
	assert.ok(looksLikeUrl("tidewater.example"));
	assert.ok(looksLikeUrl("https://linkedin.com/company/tidewater"));
	assert.ok(!looksLikeUrl("tidewater"));
	assert.ok(!looksLikeUrl("not a url.com"));
});
