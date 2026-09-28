import { type ReviewItem, type ReviewStream, streamOf } from "./types.ts";

/** Who waits on the reviewer most comes first. Titles are the live stream badges' words. */
export const QUEUE_GROUP_TITLES: Record<ReviewStream, string> = {
	interest: "Expressed interest",
	curated: "We think it's a match",
	drop: "Outstanding this week",
};
const RANK: Record<ReviewStream, number> = { interest: 0, curated: 1, drop: 2 };

const receivedMs = (item: ReviewItem) => (item.receivedAt ? Date.parse(item.receivedAt) : Number.MAX_SAFE_INTEGER);

/** Group order; inside "Expressed interest" the longest wait goes first, other groups keep the feed order. */
export function sortByQueue(items: ReviewItem[]): ReviewItem[] {
	return [...items].sort((a, b) => {
		const rank = RANK[streamOf(a.bucket)] - RANK[streamOf(b.bucket)];
		if (rank !== 0) return rank;
		return streamOf(a.bucket) === "interest" ? receivedMs(a) - receivedMs(b) : 0;
	});
}

export interface QueueSection {
	key: string;
	title: string;
	items: ReviewItem[];
}

/** Consecutive runs of the (already ordered) list; similar picks pulled forward get their own run. */
export function queueSections(items: ReviewItem[], similarToName: (item: ReviewItem) => string | undefined) {
	const sections: QueueSection[] = [];
	const seen = new Map<string, number>();
	let group: string | null = null;
	for (const item of items) {
		const anchor = similarToName(item);
		const next = anchor ? `similar:${anchor}` : streamOf(item.bucket);
		if (next === group) {
			sections[sections.length - 1].items.push(item);
			continue;
		}
		group = next;
		// Stable keys (a group's nth run), so removing one section doesn't re-key the others.
		const nth = seen.get(next) ?? 0;
		seen.set(next, nth + 1);
		sections.push({
			key: `${next}#${nth}`,
			title: anchor ? `Similar to ${anchor}` : QUEUE_GROUP_TITLES[streamOf(item.bucket)],
			items: [item],
		});
	}
	return sections;
}

/** The next item in `dir` that isn't hidden (in a closed group), or null at the end of the list. */
export function stepNavigable<T>(items: T[], from: number, dir: 1 | -1, isHidden: (item: T) => boolean): T | null {
	for (let i = from + dir; i >= 0 && i < items.length; i += dir) if (!isHidden(items[i])) return items[i];
	return null;
}
