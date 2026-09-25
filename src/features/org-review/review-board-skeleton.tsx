import { Skeleton } from "@v2/components/ui/skeleton";
import { cn } from "@v2/lib/utils";
import { REVIEW_BOARD_MAX_W, REVIEW_CONTROL_BAR_CLASSES } from "./constants";
import { ReviewBoardGridSkeleton } from "./review-board-grid-skeleton";

export function ReviewBoardSkeleton() {
	return (
		<div className={cn("flex flex-col gap-3", REVIEW_BOARD_MAX_W)}>
			<div className={REVIEW_CONTROL_BAR_CLASSES}>
				<Skeleton className="h-7 w-44 rounded-v2-md" />
				<Skeleton className="h-7 w-52 rounded-v2-md" />
				<Skeleton className="h-7 w-40 rounded-v2-md" />
			</div>
			<ReviewBoardGridSkeleton />
		</div>
	);
}

ReviewBoardSkeleton.displayName = "ReviewBoardSkeleton";
