import { cn } from "@v2/lib/utils";

const SKELETON_BASE_CLASSES = "animate-pulse max-w-full rounded-v2-md bg-v2-border-default/40"; // v2-precheck-ignore animate-pulse

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return <div className={cn(SKELETON_BASE_CLASSES, className)} {...props} />;
}
Skeleton.displayName = "Skeleton";

export { Skeleton };
