"use client";

import type { EntityChipsState } from "@v2/hooks/use-deferred-entity-chips";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ReviewCard } from "./review-card";
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
	chipsFor,
	onCardVisible,
	onCardSeen,
}: ReviewLeftListProps) {
	const prefersReducedMotion = useReducedMotion();
	const exit = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 };

	return (
		<div className="divide-y divide-v2-border-divider">
			<AnimatePresence initial={false}>
				{items.map((item) => (
					<motion.div key={reviewItemKey(item)} exit={exit} transition={{ duration: 0.15 }} className="overflow-hidden">
						<ReviewCard
							item={item}
							isSelected={selectedKey === reviewItemKey(item)}
							isPending={isPending(item)}
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
				))}
			</AnimatePresence>
		</div>
	);
}

ReviewLeftList.displayName = "ReviewLeftList";
