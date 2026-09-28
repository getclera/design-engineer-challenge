"use client";

import { formatTimeAgoCompact, MS_PER_DAY } from "@clera/shared-utils";
import { cn } from "@v2/lib/utils";
import { useSyncExternalStore } from "react";
import { type ReviewItem, streamOf } from "./types";

/** How long someone has been waiting on a decision; orange once a person who asked to meet has waited a day. */
export function ReviewWaiting({ item }: { item: ReviewItem }) {
	// "3d ago" depends on the clock, so the server and the browser can disagree: only show it once in the browser.
	const inBrowser = useSyncExternalStore(
		noop,
		() => true,
		() => false,
	);
	// A date in the future is a clock mistake: show no time rather than a wrong one, as with no date.
	if (!item.receivedAt || !inBrowser || Date.parse(item.receivedAt) > Date.now()) return null;
	const overdue = streamOf(item.bucket) === "interest" && Date.now() - Date.parse(item.receivedAt) >= MS_PER_DAY;
	return (
		<span
			title="Waiting on your decision"
			className={cn(
				"ml-auto shrink-0 pt-0.5 font-v2-body text-2xs tabular-nums",
				overdue ? "font-medium text-v2-status-warning" : "text-v2-text-tertiary",
			)}
		>
			{overdue && "waiting "}
			{formatTimeAgoCompact(item.receivedAt)}
		</span>
	);
}

ReviewWaiting.displayName = "ReviewWaiting";

const noop = () => () => {};
