"use client";

import { TalentBoardProfileSkeleton } from "@v2/features/org-shared-cards";
import type { ReactNode } from "react";
import type { ReviewItem } from "./types";

interface ReviewProfileShellProps {
	item: ReviewItem;
	top?: ReactNode;
	settled?: boolean;
}

export function ReviewProfileShell({ item, top, settled }: ReviewProfileShellProps) {
	return (
		<TalentBoardProfileSkeleton
			name={item.talentName}
			oneLiner={item.talentOneliner}
			avatarUrl={item.talentAvatarUrl}
			top={top}
			settled={settled}
		/>
	);
}

ReviewProfileShell.displayName = "ReviewProfileShell";
