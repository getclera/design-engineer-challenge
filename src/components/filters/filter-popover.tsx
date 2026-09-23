"use client";

import { CaretDown } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@v2/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@v2/components/ui/tooltip";
import { cn } from "@v2/lib/utils";
import { useState } from "react";
import type { FilterPopoverProps } from "./types";

function FilterPopover({
	label,
	children,
	isActive = false,
	activeFilterCount = 0,
	large = false,
	className,
	contentClassName,
	tooltip,
}: FilterPopoverProps) {
	const [open, setOpen] = useState(false);

	const trigger = (
		<PopoverTrigger asChild>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				className={cn(
					"group relative h-8 gap-1.5 border border-dashed border-v2-border-default/70 text-xs font-normal",
					"transition-[transform,box-shadow,background-color,border-color] duration-150 ease-out",
					"hover:-translate-y-px hover:border-v2-border-medium hover:bg-v2-bg-warm hover:shadow-v2-content",
					"active:translate-y-0 active:shadow-none",
					isActive && [
						"border-solid border-v2-text-brand/40 bg-v2-bg-badge-teal text-v2-text-brand",
						"ring-1 ring-inset ring-v2-text-brand/10",
						"hover:border-v2-text-brand/60 hover:bg-v2-bg-badge-teal",
					],
					className,
				)}
				aria-expanded={open}
			>
				{isActive && (
					<span aria-hidden="true" className="size-1.5 rounded-full bg-v2-text-brand ring-2 ring-v2-text-brand/15" />
				)}
				<span>{label}</span>
				{activeFilterCount > 0 && (
					<span
						className={cn(
							"ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-2xs font-medium tabular-nums",
							"bg-v2-text-brand text-v2-text-inverse shadow-v2-gloss",
						)}
					>
						{activeFilterCount}
					</span>
				)}
				<CaretDown
					size={11}
					weight={open ? "bold" : "regular"}
					aria-hidden="true"
					className={cn(
						"transition-[transform,color] duration-200 ease-out",
						open ? "rotate-180 text-v2-text-primary" : "text-v2-text-secondary",
						isActive && "text-v2-text-brand",
					)}
				/>
			</Button>
		</PopoverTrigger>
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			{tooltip ? (
				<Tooltip open={open ? false : undefined}>
					<TooltipTrigger asChild>{trigger}</TooltipTrigger>
					<TooltipContent side="bottom" className="max-w-64">
						{tooltip}
					</TooltipContent>
				</Tooltip>
			) : (
				trigger
			)}
			<PopoverContent
				align="start"
				sideOffset={8}
				tone="grey"
				className={cn("overflow-hidden p-0", contentClassName ?? (large ? "w-200" : "w-72"), "shadow-xl")}
			>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-v2-border-warm to-transparent"
				/>
				<div className="p-3">{children}</div>
			</PopoverContent>
		</Popover>
	);
}
FilterPopover.displayName = "FilterPopover";

export { FilterPopover };
