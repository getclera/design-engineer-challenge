"use client";

import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@v2/lib/utils";
import { Accordion as AccordionPrimitive } from "radix-ui";
import * as React from "react";

type AccordionVariant = "default" | "card";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & { variant?: AccordionVariant }
>(({ className, variant = "default", ...props }, ref) => (
	<AccordionPrimitive.Item
		ref={ref}
		className={cn(
			variant === "card"
				? "overflow-hidden rounded-v2-md border border-v2-border-warm bg-v2-bg-card"
				: "border-b border-v2-border-divider last:border-b-0",
			className,
		)}
		{...props}
	/>
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & { variant?: AccordionVariant }
>(({ className, variant = "default", children, ...props }, ref) => (
	<AccordionPrimitive.Header className="flex">
		<AccordionPrimitive.Trigger
			ref={ref}
			className={cn(
				"flex flex-1 cursor-pointer items-center justify-between text-left",
				"transition-all [&[data-state=open]>svg]:rotate-180",
				variant === "card"
					? [
							"min-h-11 gap-3 px-4 py-3 md:px-5 md:py-4",
							"font-v2-body text-base font-medium text-v2-text-primary",
							"hover:bg-v2-bg-active",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal focus-visible:ring-inset",
						]
					: [
							"py-5 font-v2-body text-lg font-normal text-v2-text-primary",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal focus-visible:ring-offset-2",
						],
				className,
			)}
			{...props}
		>
			{children}
			<CaretDown
				className={cn(
					"size-4 shrink-0 transition-transform duration-200",
					variant === "card" ? "text-v2-text-secondary" : "text-v2-text-muted",
				)}
			/>
		</AccordionPrimitive.Trigger>
	</AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & { variant?: AccordionVariant }
>(({ className, variant = "default", children, forceMount, ...props }, ref) => {
	const content = (
		<div
			className={cn(
				variant === "card"
					? "px-4 pt-0 pb-4 md:px-5 md:pb-5"
					: "pb-5 font-v2-body text-base leading-relaxed text-v2-text-secondary",
				className,
			)}
		>
			{children}
		</div>
	);

	return (
		<AccordionPrimitive.Content
			forceMount={forceMount}
			ref={ref}
			className={cn(
				"overflow-hidden",
				forceMount
					? "group/accordion-content"
					: "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
				variant === "card" && "font-v2-body text-sm text-v2-text-secondary",
			)}
			{...props}
		>
			{forceMount ? (
				<div className="grid transition-[grid-template-rows,visibility] duration-200 ease-out group-data-[state=closed]/accordion-content:invisible group-data-[state=closed]/accordion-content:grid-rows-[0fr] group-data-[state=open]/accordion-content:grid-rows-[1fr] motion-reduce:transition-none">
					<div className="min-h-0 overflow-hidden">{content}</div>
				</div>
			) : (
				content
			)}
		</AccordionPrimitive.Content>
	);
});
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger, type AccordionVariant };
