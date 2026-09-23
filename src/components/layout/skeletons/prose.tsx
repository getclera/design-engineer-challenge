import { Skeleton } from "@v2/components/ui/skeleton";
import { cn } from "@v2/lib/utils";

interface ProseSkeletonProps {
	count?: number;
	withTitle?: boolean;
	titleClassName?: string;
	lines?: number;
	lineClassName?: string;
	lastLineClassName?: string;
	sectionClassName?: string;
	className?: string;
}

function ProseSkeleton({
	count = 4,
	withTitle = true,
	titleClassName = "h-7 w-[180px]",
	lines = 3,
	lineClassName = "h-4 rounded-v2-sm",
	lastLineClassName = "w-3/4",
	sectionClassName,
	className = "space-y-10",
}: ProseSkeletonProps) {
	return (
		<div className={className}>
			{Array.from({ length: count }).map((_, i) => (
				<div key={`prose-${i}`} className={cn("space-y-3", sectionClassName)}>
					{withTitle && <Skeleton className={titleClassName} />}
					{Array.from({ length: lines }).map((_, j) => (
						<Skeleton
							key={`prose-${i}-line-${j}`}
							className={cn(lineClassName, "w-full", j === lines - 1 && lastLineClassName)}
						/>
					))}
				</div>
			))}
		</div>
	);
}
ProseSkeleton.displayName = "ProseSkeleton";

export { ProseSkeleton };
