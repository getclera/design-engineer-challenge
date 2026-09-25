"use client";

import type { EntityChipsState } from "@v2/hooks/use-deferred-entity-chips";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { SimilarTo } from "./hooks/use-similar-follow-through";
import { ReviewCard } from "./review-card";
import { queueSections } from "./review-queue";
import { type ReviewItem, reviewItemKey } from "./types";

interface ReviewLeftListProps {
	items: ReviewItem[];
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
	items,
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
	const sections = queueSections(items, (item) => similarTo.get(reviewItemKey(item))?.anchor.talentName.split(" ")[0]);

	return (
		<div className="divide-y divide-v2-border-divider">
			<AnimatePresence initial={false}>
				{sections.flatMap((section) => [
					<motion.div
						key={section.key}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="sticky top-0 z-1 flex items-center justify-between bg-v2-bg-warm px-4 py-1.5 font-v2-body font-medium text-2xs text-v2-text-tertiary uppercase tracking-wider"
					>
						<span>{section.title}</span>
						<span className="tabular-nums">{section.items.length}</span>
					</motion.div>,
					...section.items.map((item) => (
						<motion.div
							key={reviewItemKey(item)}
							exit={exit}
							transition={{ duration: 0.15 }}
							className="overflow-hidden"
						>
							<ReviewCard
								item={item}
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
