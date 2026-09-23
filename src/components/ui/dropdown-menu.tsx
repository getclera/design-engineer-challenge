"use client";

import { cn } from "@v2/lib/utils";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import * as React from "react";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
		tone?: "warm" | "dark";
	}
>(({ className, sideOffset = 8, tone = "warm", ...props }, ref) => (
	<DropdownMenuPrimitive.Portal>
		<DropdownMenuPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={cn(
				"z-50 min-w-48 overflow-hidden rounded-v2-md p-1 shadow-v2-content",
				tone === "dark"
					? "border border-white/10 bg-black/80 backdrop-blur-xl"
					: "border border-v2-border-warm bg-v2-bg-warm",
				"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
				"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
				"data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
				"data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
				className,
			)}
			{...props}
		/>
	</DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
		tone?: "warm" | "dark";
	}
>(({ className, tone = "warm", ...props }, ref) => (
	<DropdownMenuPrimitive.Item
		ref={ref}
		className={cn(
			"relative flex cursor-pointer select-none items-center gap-2 rounded-v2-sm px-3 py-2.5 outline-none transition-colors",
			"font-v2-body text-base",
			"focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-v2-brand-teal/60",
			"data-[highlighted]:ring-2 data-[highlighted]:ring-inset data-[highlighted]:ring-v2-brand-teal/60",
			tone === "dark"
				? "text-white data-[highlighted]:bg-white/10"
				: "text-v2-text-body data-[highlighted]:bg-black/[0.04]",
			"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			className,
		)}
		{...props}
	/>
));
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuSeparator = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator> & {
		tone?: "warm" | "dark";
	}
>(({ className, tone = "warm", ...props }, ref) => (
	<DropdownMenuPrimitive.Separator
		ref={ref}
		className={cn("mx-1 my-1 h-px", tone === "dark" ? "bg-white/10" : "bg-v2-border-divider", className)}
		{...props}
	/>
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuLabel = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
		tone?: "warm" | "dark";
	}
>(({ className, tone = "warm", ...props }, ref) => (
	<DropdownMenuPrimitive.Label
		ref={ref}
		className={cn(
			"px-3 py-1.5 font-v2-body text-sm font-medium",
			tone === "dark" ? "text-white/50" : "text-v2-text-secondary",
			className,
		)}
		{...props}
	/>
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSubTrigger = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>
>(({ className, children, ...props }, ref) => (
	<DropdownMenuPrimitive.SubTrigger
		ref={ref}
		className={cn(
			"flex cursor-pointer select-none items-center gap-2 rounded-v2-sm px-3 py-2.5 outline-none",
			"font-v2-body text-base text-v2-text-body",
			"focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-v2-brand-teal/60",
			"data-[highlighted]:ring-2 data-[highlighted]:ring-inset data-[highlighted]:ring-v2-brand-teal/60",
			"data-[highlighted]:bg-black/[0.04]",
			className,
		)}
		{...props}
	>
		{children}
	</DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

const DropdownMenuSubContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Portal>
		<DropdownMenuPrimitive.SubContent
			ref={ref}
			className={cn(
				"z-50 min-w-32 overflow-hidden rounded-v2-md border border-v2-border-warm bg-v2-bg-warm p-1 shadow-v2-content",
				"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
				"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
				className,
			)}
			{...props}
		/>
	</DropdownMenuPrimitive.Portal>
));
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
};
