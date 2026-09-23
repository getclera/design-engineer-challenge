"use client";

import { cn } from "@v2/lib/utils";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import * as React from "react";

const RadioGroup = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
	return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
	return (
		<RadioGroupPrimitive.Item
			ref={ref}
			className={cn(
				"aspect-square size-4 rounded-full border border-v2-border-medium text-v2-text-brand ring-offset-v2-bg-page focus:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		>
			<RadioGroupPrimitive.Indicator className="flex items-center justify-center">
				<svg className="size-2.5 fill-current" viewBox="0 0 10 10" aria-hidden="true">
					<circle cx="5" cy="5" r="5" />
				</svg>
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	);
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
