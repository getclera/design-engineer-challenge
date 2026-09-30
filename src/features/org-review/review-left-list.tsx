"use client";

import { GroupBand } from "@v2/components/data-display";
import type { EntityChipsState } from "@v2/hooks/use-deferred-entity-chips";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { SimilarTo } from "./hooks/use-similar-follow-through";
import { ReviewCard } from "./review-card";
import type { QueueSection } from "./review-queue";
import { type ReviewItem, reviewItemKey } from "./types";

interface ReviewLeftListProps {
	sections: QueueSection[];
	isOpen: (sectionKey: string) => boolean;
	onToggle: (sectionKey: string) => void;
	selectedKey: string | null;
	onSelect: (item: ReviewItem) => void;
	onOpen?: (item: ReviewItem) => void;
	onPrefetch: (talentId: string) => void;
	onIntro?: (item: ReviewItem) => void;
	onPass?: (item: ReviewItem) => void;
	isPending: (item: ReviewItem) => boolean;
	isFailed: (item: ReviewItem) => boolean;
	onRetry: (item: ReviewItem) => void;
	similarTo: ReadonlyMap<string, SimilarTo>;
	chipsFor: (talentId: string) => EntityChipsState;
	onCardVisible: (talentId: string) => void;
	onCardSeen: (talentId: string) => void;
}

export function ReviewLeftList({
	sections,
	isOpen,
	onToggle,
	selectedKey,
	onSelect,
	onOpen,
	onPrefetch,
	onIntro,
	onPass,
	isPending,
	isFailed,
	onRetry,
	similarTo,
	chipsFor,
	onCardVisible,
	onCardSeen,
}: ReviewLeftListProps) {
	const prefersReducedMotion = useReducedMotion();
	const exit = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 };
	// Someone listed for two roles gets two rows: name the role on those, or they look like a duplicate.
	const seen = new Map<string, number>();
	for (const item of sections.flatMap((s) => s.items)) seen.set(item.talentId, (seen.get(item.talentId) ?? 0) + 1);

	return (
		<div className="divide-y divide-v2-border-divider">
			<AnimatePresence initial={false}>
				{sections.flatMap((section) => [
					<motion.div
						key={section.key}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="sticky top-0 z-1"
					>
						<GroupBand
							title={section.title}
							count={section.items.length}
							open={isOpen(section.key)}
							onToggle={() => onToggle(section.key)}
						/>
					</motion.div>,
					// A closed group keeps its header and count; its people step out of the list.
					...(isOpen(section.key) ? section.items : []).map((item) => (
						<motion.div
							key={reviewItemKey(item)}
							// A failed save puts the same row back while it's still leaving: return it to its full height.
							animate={{ opacity: 1, height: "auto" }}
							exit={exit}
							transition={{ duration: 0.15 }}
							className="overflow-hidden"
						>
							<ReviewCard
								item={item}
								showRole={(seen.get(item.talentId) ?? 0) > 1}
								isSelected={selectedKey === reviewItemKey(item)}
								isPending={isPending(item)}
								failed={isFailed(item)}
								onRetry={() => onRetry(item)}
								similarToName={similarTo.get(reviewItemKey(item))?.anchor.talentName.split(" ")[0]}
								onSelect={() => onSelect(item)}
								onOpen={onOpen && (() => onOpen(item))}
								onPrefetch={() => onPrefetch(item.talentId)}
								onIntro={onIntro && (() => onIntro(item))}
								onPass={onPass && (() => onPass(item))}
								chips={chipsFor(item.talentId)}
								onVisible={onCardVisible}
								onSeen={onCardSeen}
							/>
						</motion.div>
					)),
				])}
			</AnimatePresence>
		</div>
	);
}

ReviewLeftList.displayName = "ReviewLeftList";
