import { Card } from "@v2/components/ui/card";
import { Skeleton } from "@v2/components/ui/skeleton";
import { REVIEW_BOARD_GRID_CLASSES, REVIEW_DECK_GHOST_CLASSES, REVIEW_LEFT_CARD_CLASSES } from "./constants";
import { ReviewRowSkeleton } from "./review-row-skeleton";

export function ReviewBoardGridSkeleton() {
	return (
		<div className={REVIEW_BOARD_GRID_CLASSES}>
			<Card className={REVIEW_LEFT_CARD_CLASSES}>
				<div className="relative flex flex-col gap-3 border-b border-v2-border-divider px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex min-w-0 flex-col gap-1.5">
						<Skeleton className="h-6 w-32 rounded-full" />
						<Skeleton className="h-4 w-80 max-w-full rounded-full" />
					</div>
				</div>
				<div className="divide-y divide-v2-border-divider">
					{Array.from({ length: 7 }).map((_, i) => (
						<ReviewRowSkeleton key={`row-${i}`} delay={i * 70} />
					))}
				</div>
			</Card>

			<div className="relative hidden self-start lg:block">
				{REVIEW_DECK_GHOST_CLASSES.map((ghost) => (
					<div key={ghost} aria-hidden="true" className={ghost} />
				))}
				<Card className="relative overflow-hidden p-0">
					<div className="flex items-center gap-4 px-5 py-4">
						<Skeleton className="size-16 shrink-0 rounded-full" />
						<div className="flex flex-1 flex-col gap-2">
							<Skeleton className="h-5 w-48 rounded-full" />
							<Skeleton className="h-4 w-64 max-w-full rounded-full" />
						</div>
					</div>
					<div className="flex flex-col gap-2 border-t border-v2-border-divider px-5 py-3">
						<Skeleton className="h-3 w-24 rounded-full" />
						<Skeleton className="h-3 w-80 max-w-full rounded-full" />
					</div>
					<div className="flex gap-2 border-t border-v2-border-divider px-4 py-3">
						<Skeleton className="h-11 flex-2 rounded-v2-md" />
						<Skeleton className="h-11 w-28 rounded-v2-md" />
						<Skeleton className="h-11 flex-3 rounded-v2-md" />
					</div>
				</Card>
			</div>
		</div>
	);
}

ReviewBoardGridSkeleton.displayName = "ReviewBoardGridSkeleton";
