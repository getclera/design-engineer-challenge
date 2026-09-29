"use client";

import { TalentEntityChips } from "@v2/components/data-display";
import { UserAvatar } from "@v2/components/ui/avatar";
import { Button } from "@v2/components/ui/button";
import { useHoverPrefetch } from "@v2/hooks/use-hover-prefetch";
import { useInViewport } from "@v2/hooks/use-in-viewport";
import { cn } from "@v2/lib/utils";
import { type MouseEvent, type ReactNode, useCallback, useState } from "react";
import { isRepeatClick } from "@/utils/mouse";
import { scrollTalentBoardPaneToTop } from "./talent-board-pane-scroll";

const SEEN_RATIO = 0.5;

interface TalentBoardChip {
	name: string;
	logoUrl: string | null;
}

interface TalentBoardCardItem {
	name: string | null;
	titleFallback?: string | null;
	avatarUrl: string | null;
	avatarFallback?: ReactNode;
	subtitle: string | null;
	companies: TalentBoardChip[];
	school: TalentBoardChip | null;
	chipsLoading?: boolean;
}

interface TalentBoardCardProps {
	item: TalentBoardCardItem;
	isSelected: boolean;
	onSelect: () => void;
	onOpen?: () => void;
	onPrefetch: () => void;
	badge?: ReactNode;
	footer?: ReactNode;
	onVisible?: () => void;
	onSeen?: () => void;
	cardKey?: string;
}

function TalentBoardCard({
	item,
	isSelected,
	onSelect,
	onOpen,
	onPrefetch,
	badge,
	footer,
	onVisible,
	onSeen,
	cardKey,
}: TalentBoardCardProps) {
	const isNameless = !item.name;
	const title = item.name ?? item.titleFallback ?? item.subtitle;
	const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
	const cardRef = useInViewport<HTMLButtonElement>({
		onEnter: () => {
			setHasEnteredViewport(true);
			onVisible?.();
		},
	});
	const seenRef = useInViewport<HTMLButtonElement>({
		onEnter: () => onSeen?.(),
		rootMargin: "0px",
		threshold: SEEN_RATIO,
	});
	const setCardNode = useCallback(
		(node: HTMLButtonElement | null) => {
			cardRef.current = node;
			seenRef.current = node;
		},
		[cardRef, seenRef],
	);
	const { handleMouseEnter, handleMouseLeave } = useHoverPrefetch(onPrefetch);
	const handleClick = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			if (isRepeatClick(event)) return;
			if (isSelected) scrollTalentBoardPaneToTop();
			onSelect();
		},
		[isSelected, onSelect],
	);

	return (
		<Button
			ref={setCardNode}
			type="button"
			variant="unstyled"
			size="unstyled"
			data-board-key={cardKey}
			onClick={handleClick}
			onDoubleClick={onOpen}
			onPointerEnter={handleMouseEnter}
			onPointerLeave={handleMouseLeave}
			onPointerDown={onPrefetch}
			className={cn(
				"flex w-full flex-col rounded-none border-l-2 px-4 text-left transition-colors hover:bg-v2-bg-warm",
				isNameless ? "gap-1.5 py-2.5" : "gap-2 py-3",
				isSelected ? "border-l-v2-brand-green bg-v2-bg-warm" : "border-l-transparent",
			)}
		>
			<div className="flex w-full items-center gap-3">
				<UserAvatar
					src={hasEnteredViewport ? (item.avatarUrl ?? undefined) : undefined}
					name={item.name}
					fallback={item.avatarFallback}
					className={cn("shrink-0", isNameless ? "size-8" : "size-9")}
				/>
				<div className="min-w-0 flex-1">
					<div className="flex items-start gap-1.5">
						<span
							className={cn(
								"font-v2-body font-medium text-sm text-v2-text-primary",
								isNameless ? "line-clamp-2" : "truncate",
							)}
						>
							{title}
						</span>
						{badge}
					</div>
					{item.subtitle && item.subtitle !== title && (
						<p className="mt-0.5 truncate font-v2-body text-v2-text-tertiary text-xs">{item.subtitle}</p>
					)}
				</div>
			</div>

			<TalentEntityChips
				companies={item.companies}
				school={item.school}
				isLoading={item.chipsLoading}
				className={cn("w-full", isNameless ? "pl-11" : "pl-12")}
			/>
			{footer && <div className={cn("w-full", isNameless ? "pl-11" : "pl-12")}>{footer}</div>}
		</Button>
	);
}
TalentBoardCard.displayName = "TalentBoardCard";

export type { TalentBoardCardItem, TalentBoardCardProps, TalentBoardChip };
export { TalentBoardCard };
