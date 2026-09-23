import { Badge } from "@v2/components/ui/badge";
import { cn } from "@v2/lib/utils";

const TONE_CLASSES = {
	active: "border border-v2-brand-green/20 bg-v2-status-active-bg text-v2-text-brand-green",
	info: "border border-v2-status-info/20 bg-v2-status-info-bg text-v2-status-info",
	warning: "border border-v2-status-warning/20 bg-v2-status-warning-bg text-v2-status-warning",
	error: "border border-v2-status-error/20 bg-v2-status-error-bg text-v2-status-error",
	neutral: "border border-v2-status-neutral/20 bg-v2-status-neutral-bg text-v2-status-neutral",
} as const;

type StatusTone = keyof typeof TONE_CLASSES;

interface StatusBadgeProps {
	label: string;
	tone?: StatusTone;
	withDot?: boolean;
	className?: string;
}

function StatusBadge({ label, tone = "active", withDot = false, className }: StatusBadgeProps) {
	return (
		<Badge
			variant="muted"
			className={cn("shrink-0 whitespace-nowrap px-2 py-0.5 text-xs", TONE_CLASSES[tone], className)}
		>
			{withDot ? (
				<span aria-hidden="true" className="mr-1 inline-block size-1.5 rounded-full bg-current opacity-70" />
			) : null}
			{label}
		</Badge>
	);
}
StatusBadge.displayName = "StatusBadge";

export { StatusBadge, type StatusBadgeProps, type StatusTone };
