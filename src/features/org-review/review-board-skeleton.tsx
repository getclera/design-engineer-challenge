import { Skeleton } from "@v2/components/ui/skeleton";
import { REVIEW_CONTROL_BAR_CLASSES } from "./constants";
import { ReviewBoardGridSkeleton } from "./review-board-grid-skeleton";

export function ReviewBoardSkeleton() {
	return (
		<div className="flex flex-col gap-3">
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
