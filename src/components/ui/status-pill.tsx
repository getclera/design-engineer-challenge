import { cn } from "@v2/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const statusPillVariants = cva(
	"inline-flex items-center gap-1.5 font-v2-body font-medium leading-none whitespace-nowrap select-none",
	{
		variants: {
			tone: {
				active: "bg-v2-status-active-bg text-v2-status-active",
				warning: "bg-v2-status-warning-bg text-v2-status-warning",
				error: "bg-v2-status-error-bg text-v2-status-error",
				info: "bg-v2-status-info-bg text-v2-status-info",
				neutral: "bg-v2-status-neutral-bg text-v2-status-neutral",
				muted: "bg-v2-bg-input-solid text-v2-text-tertiary",
			},
			shape: {
				pill: "rounded-v2-full",
				rect: "rounded-v2-sm",
			},
			size: {
				xs: "h-5 px-1.5 text-2xs",
				sm: "h-6 px-2 text-2xs",
				md: "h-7 px-2.5 text-xs",
			},
			outlined: {
				true: "border",
				false: "",
			},
		},
		compoundVariants: [
			{ outlined: true, tone: "active", className: "border-v2-status-active/30" },
			{ outlined: true, tone: "warning", className: "border-v2-status-warning/30" },
			{ outlined: true, tone: "error", className: "border-v2-status-error/30" },
			{ outlined: true, tone: "info", className: "border-v2-status-info/30" },
			{ outlined: true, tone: "neutral", className: "border-v2-status-neutral/30" },
			{ outlined: true, tone: "muted", className: "border-v2-border-default" },
		],
		defaultVariants: {
			tone: "neutral",
			shape: "pill",
			size: "sm",
			outlined: false,
		},
	},
);

type StatusPillProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof statusPillVariants>;

const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
	({ className, tone, shape, size, outlined, ...props }, ref) => (
		<span ref={ref} className={cn(statusPillVariants({ tone, shape, size, outlined }), className)} {...props} />
	),
);
StatusPill.displayName = "StatusPill";

export { StatusPill, type StatusPillProps, statusPillVariants };
