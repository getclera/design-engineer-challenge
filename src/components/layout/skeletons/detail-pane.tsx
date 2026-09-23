import { Card } from "@v2/components/ui/card";
import { Skeleton } from "@v2/components/ui/skeleton";

function DetailPaneSkeleton() {
	return (
		<div className="mx-auto flex w-full max-w-230 flex-col gap-2.5 px-4 py-3 sm:px-6 sm:py-4">
			<Card variant="flat" className="overflow-hidden">
				<div className="flex items-center gap-3.5 px-4 py-3 sm:px-5 sm:py-3.5">
					<Skeleton className="size-14 shrink-0 rounded-full" />
					<div className="flex min-w-0 flex-1 flex-col gap-1.5">
						<Skeleton className="h-5 w-48 rounded-full" />
						<Skeleton className="h-4 w-64 max-w-full rounded-full" />
						<Skeleton className="h-3 w-32 rounded-full" />
					</div>
				</div>
			</Card>
			<Skeleton className="h-40 w-full rounded-v2-lg" />
			<Skeleton className="h-28 w-full rounded-v2-lg" />
			<Skeleton className="h-24 w-full rounded-v2-lg" />
		</div>
	);
}
DetailPaneSkeleton.displayName = "DetailPaneSkeleton";

export { DetailPaneSkeleton };
