"use client";

import { Check, Minus } from "@phosphor-icons/react";
import { cn } from "@v2/lib/utils";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import * as React from "react";

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(
			"peer size-4 shrink-0 rounded-sm border border-v2-border-medium",
			"bg-v2-bg-card transition-colors",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal focus-visible:ring-offset-1",
			"disabled:cursor-not-allowed disabled:opacity-50",
			"data-[state=checked]:bg-v2-text-brand data-[state=checked]:border-v2-text-brand data-[state=checked]:text-v2-text-inverse",
			"data-[state=indeterminate]:bg-v2-text-brand data-[state=indeterminate]:border-v2-text-brand data-[state=indeterminate]:text-v2-text-inverse",
			className,
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
			{props.checked === "indeterminate" ? (
				<Minus className="size-3" weight="bold" />
			) : (
				<Check className="size-3" weight="bold" />
			)}
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";

export { Checkbox };
