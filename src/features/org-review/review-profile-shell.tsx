"use client";

import { TalentBoardProfileSkeleton } from "@v2/features/org-shared-cards";
import type { ReviewItem } from "./types";

interface ReviewProfileShellProps {
	item: ReviewItem;
}

export function ReviewProfileShell({ item }: ReviewProfileShellProps) {
	return (
		<TalentBoardProfileSkeleton
			name={item.talentName}
			oneLiner={item.talentOneliner}
			avatarUrl={item.talentAvatarUrl}
		/>
	);
}

ReviewProfileShell.displayName = "ReviewProfileShell";
