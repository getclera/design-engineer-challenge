"use client";

import { REVIEW_STREAMS, type ReviewStream } from "./types";

export function setReviewUrlParams(mutations: Record<string, string | undefined>): void {
	const url = new URL(window.location.href);
	for (const [key, value] of Object.entries(mutations)) {
		if (value) url.searchParams.set(key, value);
		else url.searchParams.delete(key);
	}
	window.history.replaceState(null, "", url.toString());
}

export function parseReviewStreams(value: string | undefined): ReviewStream[] | undefined {
	if (!value) return undefined;
	const requested = value.split(",");
	const parsed = REVIEW_STREAMS.filter((s) => requested.includes(s));
	return parsed.length > 0 && parsed.length < REVIEW_STREAMS.length ? parsed : undefined;
}

export function serializeReviewStreams(streams: ReviewStream[]): string | undefined {
	return streams.length < REVIEW_STREAMS.length ? [...streams].sort().join(",") : undefined;
}
