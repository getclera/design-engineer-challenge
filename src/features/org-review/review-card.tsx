"use client";

import { Button } from "@v2/components/ui/button";
import { StatusPill } from "@v2/components/ui/status-pill";
import { TalentBoardCard } from "@v2/features/org-shared-cards";
import type { EntityChipsState } from "@v2/hooks/use-deferred-entity-chips";
import { ReviewCardActions } from "./review-card-actions";
import { ReviewWaiting } from "./review-waiting";
import { type ReviewItem, reviewItemKey } from "./types";

interface ReviewCardProps {
	item: ReviewItem;
	/** Name the role on the row (the same person is listed for more than one). */
	showRole?: boolean;
	isSelected: boolean;
	isPending?: boolean;
	failed?: boolean;
	onRetry?: () => void;
	/** First name of the person whose intro pulled this card forward. */
	similarToName?: string;
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
	showRole = false,
	isSelected,
	isPending = false,
	failed = false,
	onRetry,
	similarToName,
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
	const roleTag = showRole && item.roleName;
	const tags = (
		<>
			{roleTag && (
				<StatusPill tone="neutral" size="xs" className="max-w-full truncate" title={item.roleName ?? undefined}>
					{item.roleName}
				</StatusPill>
			)}
			{similarToName && (
				<StatusPill tone="info" size="xs">
					Similar profiles to {similarToName}
				</StatusPill>
			)}
			{!item.roleId && (
				<StatusPill tone="warning" size="xs">
					No role yet
				</StatusPill>
			)}
			{item.maybe?.note && (
				<StatusPill tone="warning" size="xs" className="max-w-full truncate">
					“{item.maybe.note}”
				</StatusPill>
			)}
			{failed && (
				<StatusPill tone="error" size="xs">
					Not saved
				</StatusPill>
			)}
		</>
	);
	const hasTags = !!roleTag || !!similarToName || !item.roleId || !!item.maybe?.note || failed;

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
			badge={item.source !== "passed" ? <ReviewWaiting item={item} /> : undefined}
			onVisible={() => onVisible(item.talentId)}
			onSeen={onSeen && (() => onSeen(item.talentId))}
			footer={hasTags ? <div className="flex flex-wrap gap-1.5">{tags}</div> : undefined}
		/>
	);
	// The card is itself a button, so Try again sits beside it rather than inside.
	const retry = failed && onRetry && (
		<Button variant="ghost" size="compact" onClick={onRetry} className="absolute right-4 bottom-2.5">
			Try again
		</Button>
	);

	if (!hasActions)
		return retry ? (
			<div className="relative">
				{card}
				{retry}
			</div>
		) : (
			card
		);

	return (
		<div className="group relative">
			{card}
			<ReviewCardActions talentName={item.talentName} isPending={isPending} onIntro={onIntro} onPass={onPass} />
			{retry}
		</div>
	);
}

ReviewCard.displayName = "ReviewCard";
