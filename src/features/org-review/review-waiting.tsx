"use client";

import { formatTimeAgoCompact, MS_PER_DAY } from "@clera/shared-utils";
import { cn } from "@v2/lib/utils";
import { type ReviewItem, streamOf } from "./types";

/** How long someone has been waiting on a decision; orange once a person who asked to meet has waited a day. */
export function ReviewWaiting({ item }: { item: ReviewItem }) {
	if (!item.receivedAt) return null;
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
