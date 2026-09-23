"use client";

import { cn } from "@v2/lib/utils";
import { Popover as PopoverPrimitive } from "radix-ui";
import * as React from "react";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

type PopoverContentTone = "grey" | "warm";

// Radix Dialog's react-remove-scroll lock cancels wheel/touch events raised outside the dialog content.
function useScrollableInsideDialog(ref: React.ForwardedRef<HTMLDivElement>) {
	const attachedNodeRef = React.useRef<HTMLDivElement | null>(null);
	const keepScrollEventFromDocument = React.useCallback((event: Event) => event.stopPropagation(), []);

	return React.useCallback(
		(node: HTMLDivElement | null) => {
			const previous = attachedNodeRef.current;
			if (previous) {
				previous.removeEventListener("wheel", keepScrollEventFromDocument);
				previous.removeEventListener("touchmove", keepScrollEventFromDocument);
			}

			attachedNodeRef.current = node;
			if (node) {
				node.addEventListener("wheel", keepScrollEventFromDocument);
				node.addEventListener("touchmove", keepScrollEventFromDocument);
			}

			if (typeof ref === "function") ref(node);
			else if (ref) ref.current = node;
		},
		[ref, keepScrollEventFromDocument],
	);
}

const PopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & { tone?: PopoverContentTone }
>(({ className, align = "center", sideOffset = 4, tone = "warm", ...props }, ref) => {
	const contentRef = useScrollableInsideDialog(ref);

	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				ref={contentRef}
				align={align}
				sideOffset={sideOffset}
				className={cn(
					"z-50 w-72 p-4 shadow-v2-content",
					tone === "grey"
						? "rounded-v2-md border border-v2-bg-input-solid bg-v2-bg-card"
						: "rounded-v2-md border border-v2-border-warm bg-v2-bg-warm",
					"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
					"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
					"data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
					className,
				)}
				{...props}
			/>
		</PopoverPrimitive.Portal>
	);
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
