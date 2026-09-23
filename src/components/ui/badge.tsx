import { cn } from "@v2/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const badgeVariants = cva(
	"inline-flex items-center justify-center rounded-v2-full px-3 py-1 font-v2-body text-xs font-medium leading-none select-none",
	{
		variants: {
			variant: {
				match: "bg-v2-bg-badge-teal text-v2-text-brand border border-v2-text-brand/20",
				recommended: "bg-v2-brand-teal-badge text-v2-text-inverse tracking-wide",
				status: "bg-v2-bg-active text-v2-status-active border border-v2-status-active/30",
				muted: "bg-v2-bg-input-solid text-v2-text-tertiary",
				info: "bg-v2-bg-badge-teal text-v2-text-brand",
				destructive: "bg-v2-status-error-bg text-v2-status-error border border-v2-status-error/30",
			},
		},
		defaultVariants: {
			variant: "muted",
		},
	},
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant, ...props }, ref) => {
	return <span className={cn(badgeVariants({ variant, className }))} ref={ref} {...props} />;
});
Badge.displayName = "Badge";

export { Badge, badgeVariants };
