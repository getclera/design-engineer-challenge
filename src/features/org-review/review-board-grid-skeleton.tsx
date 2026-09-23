import { DetailPaneSkeleton } from "@v2/components/layout";
import { Card } from "@v2/components/ui/card";
import { Skeleton } from "@v2/components/ui/skeleton";
import { REVIEW_BOARD_GRID_CLASSES, REVIEW_LEFT_CARD_CLASSES, REVIEW_RIGHT_CARD_CLASSES } from "./constants";
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
					<Skeleton className="h-4 w-24 shrink-0 rounded-full" />
				</div>
				<div className="divide-y divide-v2-border-divider">
					{Array.from({ length: 7 }).map((_, i) => (
						<ReviewRowSkeleton key={`row-${i}`} delay={i * 70} />
					))}
				</div>
			</Card>

			<Card className={REVIEW_RIGHT_CARD_CLASSES}>
				<DetailPaneSkeleton />
			</Card>
		</div>
	);
}

ReviewBoardGridSkeleton.displayName = "ReviewBoardGridSkeleton";
