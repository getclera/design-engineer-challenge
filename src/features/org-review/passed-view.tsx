"use client";

import { ArrowCounterClockwise, WarningCircle } from "@phosphor-icons/react";
import { EmptyState } from "@v2/components/data-display";
import { Button } from "@v2/components/ui/button";
import { Card } from "@v2/components/ui/card";
import { Skeleton } from "@v2/components/ui/skeleton";
import { OrgTalentProfileSheet } from "@v2/features/org-talent-profile";
import { useDeferredEntityChips } from "@v2/hooks/use-deferred-entity-chips";
import { useState } from "react";
import { AdminPassButton } from "./admin-pass-button";
import { usePassedItems } from "./hooks/use-passed-items";
import { useReviewBoardContext } from "./review-board-context";
import { ReviewCard } from "./review-card";
import { ReviewRowSkeleton } from "./review-row-skeleton";
import type { ReviewItem } from "./types";

interface PassedViewProps {
	orgId: string;
	selectedRoleId?: string;
	viewerIsPlatformAdmin?: boolean;
}

export function PassedView({ orgId, selectedRoleId, viewerIsPlatformAdmin = false }: PassedViewProps) {
	const { uncountReviewed } = useReviewBoardContext();
	const { query, unpass } = usePassedItems(orgId, selectedRoleId, { onUnpassed: uncountReviewed });
	const [selected, setSelected] = useState<ReviewItem | null>(null);
	const items = query.data?.items ?? [];
	const { chipsFor, onCardVisible } = useDeferredEntityChips(
		orgId,
		items.map((item) => item.talentId),
	);

	if (query.isLoading) {
		return (
			<Card className="overflow-hidden p-0">
				<div className="divide-y divide-v2-border-divider">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={`passed-row-${i}`} className="flex items-center gap-2">
							<div className="min-w-0 flex-1">
								<ReviewRowSkeleton delay={i * 70} />
							</div>
							<Skeleton className="mr-3 h-9 w-28 shrink-0 rounded-v2-md" />
						</div>
					))}
				</div>
			</Card>
		);
	}

	if (query.isError) {
		return (
			<EmptyState
				icon={<WarningCircle />}
				heading="Couldn't load passed candidates"
				description="Something went wrong. Refresh the page to try again."
			/>
		);
	}

	if (items.length === 0) {
		return (
			<EmptyState
				heading="No passed candidates"
				description="Candidates you pass on show up here, so you can bring them back if you change your mind."
			/>
		);
	}

	return (
		<>
			<Card className="overflow-hidden p-0">
				<div className="divide-y divide-v2-border-divider">
					{items.map((item) => {
						const oppId = item.opportunityId;
						return (
							<div key={`${item.talentId}:${oppId}`} className="flex items-center gap-2 pr-3">
								<div className="min-w-0 flex-1">
									<ReviewCard
										item={item}
										isSelected={selected?.talentId === item.talentId && selected?.opportunityId === oppId}
										onSelect={() => setSelected(item)}
										onPrefetch={() => {}}
										chips={chipsFor(item.talentId)}
										onVisible={onCardVisible}
									/>
								</div>
								{oppId !== null && (
									<Button
										variant="ghost"
										size="sm"
										className="shrink-0 gap-1.5"
										onClick={(e) => {
											e.stopPropagation();
											unpass.mutate(oppId);
										}}
									>
										<ArrowCounterClockwise size={14} weight="bold" />
										Bring back
									</Button>
								)}
								{viewerIsPlatformAdmin && (
									<AdminPassButton orgId={orgId} item={item} roleId={selectedRoleId} className="shrink-0" />
								)}
							</div>
						);
					})}
				</div>
			</Card>

			<OrgTalentProfileSheet
				open={!!selected}
				onOpenChange={(next) => {
					if (!next) setSelected(null);
				}}
				orgId={orgId}
				talentId={selected?.talentId ?? null}
				talentName={selected?.talentName ?? null}
				avatarUrlFallback={selected?.talentAvatarUrl ?? null}
				surface="review_passed"
			/>
		</>
	);
}

PassedView.displayName = "PassedView";
