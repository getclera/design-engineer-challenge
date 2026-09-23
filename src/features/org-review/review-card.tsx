"use client";

import { TalentBoardCard } from "@v2/features/org-shared-cards";
import type { EntityChipsState } from "@v2/hooks/use-deferred-entity-chips";
import { ReviewCardActions } from "./review-card-actions";
import { StreamBadge } from "./stream-badge";
import { type ReviewItem, reviewItemKey, streamOf } from "./types";

interface ReviewCardProps {
	item: ReviewItem;
	isSelected: boolean;
	isPending?: boolean;
	onSelect: () => void;
	onOpen?: () => void;
	onPrefetch: () => void;
	onIntro?: () => void;
	onPass?: () => void;
	chips: EntityChipsState;
	onVisible: (talentId: string) => void;
	onSeen?: (talentId: string) => void;
}

export function ReviewCard({
	item,
	isSelected,
	isPending = false,
	onSelect,
	onOpen,
	onPrefetch,
	onIntro,
	onPass,
	chips,
	onVisible,
	onSeen,
}: ReviewCardProps) {
	const hasActions = !!onIntro && !!onPass;

	const card = (
		<TalentBoardCard
			cardKey={reviewItemKey(item)}
			item={{
				name: item.talentName,
				avatarUrl: item.talentAvatarUrl,
				subtitle: item.talentOneliner,
				companies: chips.companies,
				school: chips.school,
				chipsLoading: chips.isLoading,
			}}
			isSelected={isSelected}
			onSelect={onSelect}
			onOpen={onOpen}
			onPrefetch={onPrefetch}
			badge={item.source !== "passed" ? <StreamBadge stream={streamOf(item.bucket)} /> : undefined}
			onVisible={() => onVisible(item.talentId)}
			onSeen={onSeen && (() => onSeen(item.talentId))}
		/>
	);

	if (!hasActions) return card;

	return (
		<div className="group relative">
			{card}
			<ReviewCardActions
				talentName={item.talentName}
				isPending={isPending}
				isPinned={isSelected}
				onIntro={onIntro}
				onPass={onPass}
			/>
		</div>
	);
}

ReviewCard.displayName = "ReviewCard";
