"use client";

import { cn } from "@v2/lib/utils";
import { Separator as SeparatorPrimitive } from "radix-ui";
import * as React from "react";

const Separator = React.forwardRef<
	React.ElementRef<typeof SeparatorPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
	<SeparatorPrimitive.Root
		ref={ref}
		decorative={decorative}
		orientation={orientation}
		className={cn(
			"shrink-0 bg-v2-border-divider",
			orientation === "horizontal" ? "h-px w-full" : "self-stretch w-px",
			className,
		)}
		{...props}
	/>
));
Separator.displayName = "Separator";

export { Separator };
