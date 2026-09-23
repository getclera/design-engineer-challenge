import { X } from "@phosphor-icons/react/ssr";
import { cn } from "@v2/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const tagVariants = cva("inline-flex items-center gap-1.5 font-v2-body text-sm text-v2-text-body select-none", {
	variants: {
		variant: {
			display: "bg-v2-bg-input-solid rounded-v2-sm h-8.75 px-3",
			filter: "bg-v2-bg-card rounded-v2-full h-10.5 px-4 border border-v2-border-medium/50",
			active: "bg-v2-bg-active rounded-v2-full h-10 px-4 border border-v2-status-active",
		},
	},
	defaultVariants: {
		variant: "display",
	},
});

type TagProps = React.HTMLAttributes<HTMLSpanElement> &
	VariantProps<typeof tagVariants> & {
		onDismiss?: () => void;
		dismissLabel?: string;
	};

const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
	({ className, variant, onDismiss, dismissLabel = "Remove", children, ...props }, ref) => (
		<span ref={ref} className={cn(tagVariants({ variant }), className)} {...props}>
			{children}
			{onDismiss !== undefined && (
				<button // v2-precheck-ignore raw-html-form
					type="button"
					onClick={onDismiss}
					aria-label={dismissLabel}
					className="relative -my-2 -mr-2 ml-1 p-2 rounded-full flex items-center justify-center hover:bg-v2-text-body/10 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal/60"
				>
					<X className="size-3.5" />
				</button>
			)}
		</span>
	),
);
Tag.displayName = "Tag";

export { Tag, type TagProps, tagVariants };
