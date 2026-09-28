import assert from "node:assert/strict";
import { test } from "node:test";
import { usableProfileLink } from "./url.ts";

test("profile links that can't open are dropped", () => {
	for (const bad of [
		"htp://noah-becker",
		"not provided",
		"linkedin.com/in/",
		"https://linkedin.com/in/",
		"",
		null,
		"noah",
	]) {
		assert.equal(usableProfileLink(bad), null, String(bad));
	}
});

test("real profile links are kept, with https:// added when missing", () => {
	assert.equal(usableProfileLink("https://www.linkedin.com/in/noah"), "https://www.linkedin.com/in/noah");
	assert.equal(usableProfileLink("http://noah.dev"), "http://noah.dev");
	assert.equal(usableProfileLink(" github.com/noah "), "https://github.com/noah");
	assert.equal(usableProfileLink("linkedin.com/in/noah-becker"), "https://linkedin.com/in/noah-becker");
});
