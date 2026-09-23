import { Skeleton } from "@v2/components/ui/skeleton";

interface ReviewRowSkeletonProps {
	delay: number;
}

export function ReviewRowSkeleton({ delay }: ReviewRowSkeletonProps) {
	return (
		<div className="flex w-full flex-col gap-2 border-l-2 border-l-transparent px-4 py-3">
			<div className="flex w-full items-start gap-3">
				<Skeleton
					className="size-9 shrink-0 rounded-full animation-delay-(--delay)"
					style={{ "--delay": `${delay}ms` }}
				/>
				<div className="flex min-w-0 flex-1 flex-col gap-0.5">
					<div className="flex items-center gap-1.5">
						<Skeleton className="h-4 w-32 rounded-full animation-delay-(--delay)" style={{ "--delay": `${delay}ms` }} />
						<Skeleton
							className="h-4.75 w-20 shrink-0 rounded-full bg-v2-status-warning/15 animation-delay-(--delay)"
							style={{ "--delay": `${delay + 60}ms` }}
						/>
					</div>
					<Skeleton
						className="h-4 w-48 max-w-full rounded-full animation-delay-(--delay)"
						style={{ "--delay": `${delay + 120}ms` }}
					/>
				</div>
			</div>
			<div className="flex w-full items-center gap-1.5 pl-12">
				<Skeleton
					className="h-4.75 w-24 rounded-v2-sm animation-delay-(--delay)"
					style={{ "--delay": `${delay + 160}ms` }}
				/>
				<Skeleton
					className="h-4.75 w-16 rounded-v2-sm animation-delay-(--delay)"
					style={{ "--delay": `${delay + 200}ms` }}
				/>
			</div>
		</div>
	);
}

ReviewRowSkeleton.displayName = "ReviewRowSkeleton";
