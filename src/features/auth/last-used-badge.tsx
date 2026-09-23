import { StatusPill } from "@v2/components/ui/status-pill";
import { cn } from "@v2/lib/utils";

function LastUsedBadge({ className }: { className?: string }) {
	return (
		<StatusPill tone="info" className={cn("absolute right-3 top-1/2 -translate-y-1/2", className)}>
			Last used
		</StatusPill>
	);
}
LastUsedBadge.displayName = "LastUsedBadge";

export { LastUsedBadge };
