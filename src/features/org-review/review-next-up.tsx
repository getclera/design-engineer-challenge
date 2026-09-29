"use client";

import { UserAvatar } from "@v2/components/ui/avatar";
import { QUEUE_GROUP_TITLES } from "./review-queue";
import { type ReviewItem, streamOf } from "./types";

/** Who the reviewer lands on after deciding, so there's no hunting for the next person. */
export function ReviewNextUp({ item }: { item: ReviewItem }) {
	return (
		<div className="flex items-center gap-2 border-t border-v2-border-divider bg-v2-bg-warm px-4 py-2 font-v2-body text-v2-text-tertiary text-xs">
			<span className="shrink-0">Next up</span>
			<UserAvatar src={item.talentAvatarUrl} name={item.talentName} size="xs" className="shrink-0" />
			<span className="min-w-0 truncate">
				<b className="font-medium text-v2-text-primary">{item.talentName}</b> ·{" "}
				{QUEUE_GROUP_TITLES[streamOf(item.bucket)]}
			</span>
		</div>
	);
}

ReviewNextUp.displayName = "ReviewNextUp";
