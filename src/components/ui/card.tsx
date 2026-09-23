import { cn } from "@v2/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const cardVariants = cva("bg-v2-bg-card rounded-v2-lg border border-v2-border-warm overflow-clip", {
	variants: {
		variant: {
			default: "shadow-v2-card",
			flat: "",
			interactive: "shadow-v2-card transition-shadow cursor-pointer hover:shadow-v2-content",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant, ...props }, ref) => (
	<div ref={ref} className={cn(cardVariants({ variant, className }))} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />,
);
CardHeader.displayName = "CardHeader";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => <div ref={ref} className={cn("px-5 pb-5", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("flex items-center gap-3 px-5 pb-5", className)} {...props} />
	),
);
CardFooter.displayName = "CardFooter";

export { Card, CardContent, CardFooter, CardHeader, cardVariants };
