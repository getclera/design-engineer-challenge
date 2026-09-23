"use client";

import { Card } from "@v2/components/ui/card";
import { Skeleton } from "@v2/components/ui/skeleton";

const SECTION_CARD_COUNT = 7;

function OrgProfileSkeleton() {
	return (
		<div className="mx-auto flex w-full max-w-230 flex-col gap-2.5 px-4 py-3 sm:px-6 sm:py-4">
			<Card variant="flat" className="overflow-hidden px-4 py-3 sm:px-5 sm:py-3.5">
				<div className="flex items-center gap-3.5">
					<Skeleton className="size-14 shrink-0 rounded-full" />
					<div className="flex flex-1 flex-col gap-1.5">
						<Skeleton className="h-5 w-48" />
						<Skeleton className="h-3.5 w-64" />
						<Skeleton className="h-3 w-32" />
					</div>
				</div>
			</Card>
			{Array.from({ length: SECTION_CARD_COUNT }).map((_, i) => (
				<Card key={`skel-card-${i}`} variant="flat" className="overflow-hidden">
					<div className="flex items-center gap-2 px-4 py-3 sm:px-5">
						<Skeleton className="size-4 rounded" />
						<Skeleton className="h-4 w-24" />
					</div>
					<div className="flex flex-col gap-2 border-t border-v2-border-warm/50 px-4 py-3 sm:px-5">
						<Skeleton className="h-3.5 w-full" />
						<Skeleton className="h-3.5 w-3/4" />
					</div>
				</Card>
			))}
		</div>
	);
}
OrgProfileSkeleton.displayName = "OrgProfileSkeleton";

export { OrgProfileSkeleton };
