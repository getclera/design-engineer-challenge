import assert from "node:assert/strict";
import { test } from "node:test";
import { extractFitReasonDetails, extractFitReasonHook } from "./submission-reason-format.ts";

// The fit reason formats the review feed really receives (see mock/review-items.ts).
test("a labelled pitch gives its first line, without the label", () => {
	assert.equal(
		extractFitReasonHook("Why this fit: Owns Vantle's public API and SDKs.\n\n• Good docs writer"),
		"Owns Vantle's public API and SDKs.",
	);
});

test("a single sentence is the hook itself", () => {
	const sentence = "Strong fintech background and has worked on KYC pipelines in a regulated environment.";
	assert.equal(extractFitReasonHook(sentence), sentence);
});

test("literal \\n escapes, Slack markup and numbered lists are cleaned", () => {
	assert.equal(extractFitReasonHook("Why now: Just finished.\\n\\n• Strong"), "Just finished.");
	assert.equal(extractFitReasonHook("*Why this fit:* Wrote the compaction layer.\n\n• x"), "Wrote the compaction layer.");
	assert.equal(extractFitReasonHook("1) Asked for an intro herself.\n2) Managed 4 designers"), "Asked for an intro herself.");
});

test("a long paragraph is cut to two sentences, and empty input gives nothing", () => {
	const hook = extractFitReasonHook("One. Two. Three. Four.");
	assert.equal(hook, "One. Two.");
	assert.equal(extractFitReasonHook(null), null);
	assert.equal(extractFitReasonHook("   "), null);
});

test("the details are the lines after the hook, without markers or markup", () => {
	assert.deepEqual(
		extractFitReasonDetails("*Why this fit:* Wrote the compaction layer.\n\n• _Rust_ and Go\n• Talks at two database conferences"),
		["Rust and Go", "Talks at two database conferences"],
	);
	assert.deepEqual(extractFitReasonDetails("1) Asked for an intro herself.\n2) Managed 4 designers\n3) Strong systems thinker"), [
		"Managed 4 designers",
		"Strong systems thinker",
	]);
	assert.deepEqual(extractFitReasonDetails("Why this fit: Led it.\\n\\n• Research-heavy process"), ["Research-heavy process"]);
	assert.deepEqual(extractFitReasonDetails("A single sentence."), []);
	assert.deepEqual(extractFitReasonDetails(null), []);
});
