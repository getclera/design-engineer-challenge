import { Card } from "@v2/components/ui/card";
import { cn } from "@v2/lib/utils";
import type { ReactNode } from "react";

interface EmptyStateProps {
	icon?: ReactNode;
	iconStyle?: "icon-only" | "boxed";
	heading?: string;
	description: ReactNode;
	layout?: "card" | "plain";
	size?: "compact" | "default";
	actions?: ReactNode;
	live?: boolean;
	className?: string;
}

function EmptyState({
	icon,
	iconStyle = "icon-only",
	heading,
	description,
	layout = "plain",
	size = "default",
	actions,
	live = false,
	className,
}: EmptyStateProps) {
	const isCompact = size === "compact";
	const liveProps = live ? ({ role: "status", "aria-live": "polite" } as const) : undefined;

	const body = (
		<div className={cn("flex flex-col items-center justify-center text-center", isCompact ? "py-6" : "py-12 lg:py-16")}>
			{icon &&
				(iconStyle === "boxed" ? (
					<div
						className={cn(
							"flex items-center justify-center rounded-full bg-v2-bg-warm text-v2-text-muted",
							isCompact ? "mb-3 size-10" : "mb-4 size-12",
						)}
					>
						{icon}
					</div>
				) : (
					<div className={cn("text-v2-text-tertiary", isCompact ? "mb-3" : "mb-5")}>{icon}</div>
				))}

			{heading && (
				<h3
					className={cn(
						"font-v2-heading font-semibold text-v2-text-primary",
						isCompact ? "mb-1.5 text-base" : "mb-2 text-lg lg:text-xl",
					)}
				>
					{heading}
				</h3>
			)}

			<div
				className={cn(
					"font-v2-body font-light leading-relaxed text-v2-text-secondary",
					isCompact ? "max-w-80 text-sm" : "max-w-105 text-sm lg:text-base",
				)}
			>
				{description}
			</div>

			{actions && (
				<div className={cn("flex flex-col items-center justify-center gap-3 sm:flex-row", isCompact ? "mt-4" : "mt-6")}>
					{actions}
				</div>
			)}
		</div>
	);

	if (layout === "card") {
		return (
			<Card className={cn("p-6 sm:p-10", className)} {...liveProps}>
				{body}
			</Card>
		);
	}
	return (
		<div className={className} {...liveProps}>
			{body}
		</div>
	);
}
EmptyState.displayName = "EmptyState";

export { EmptyState, type EmptyStateProps };
