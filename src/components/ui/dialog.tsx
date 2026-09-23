"use client";

import { X } from "@phosphor-icons/react";
import { cn } from "@v2/lib/utils";
import { Dialog as DialogPrimitive } from "radix-ui";
import * as React from "react";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			"fixed inset-0 z-50 bg-black/40",
			"data-[state=open]:animate-in data-[state=open]:fade-in-0",
			"data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
			className,
		)}
		{...props}
	/>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<DialogPortal>
		<DialogOverlay />
		<DialogPrimitive.Content
			ref={ref}
			className={cn(
				"fixed inset-0 z-50 w-full h-dvh max-h-dvh",
				"border border-v2-border-warm bg-v2-bg-warm shadow-v2-card",
				"flex flex-col p-0 gap-0",
				"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
				"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
				"md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
				"md:w-[calc(100%-2rem)] md:max-w-273 md:h-auto md:max-h-[90vh] md:rounded-v2-lg",
				className,
			)}
			{...props}
		>
			{children}
			<DialogPrimitive.Close
				type="button"
				className={cn(
					"absolute right-4 top-4 flex items-center gap-1.5 rounded p-1",
					"text-v2-text-secondary hover:bg-v2-bg-input-solid",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal focus-visible:ring-offset-2",
					"transition-colors disabled:pointer-events-none",
				)}
			>
				<span className="hidden md:inline-flex rounded bg-v2-bg-input-solid px-1.5 py-0.5 text-2xs font-medium text-v2-text-tertiary">
					Esc
				</span>
				<X className="size-4" />
				<span className="sr-only">Close</span>
			</DialogPrimitive.Close>
		</DialogPrimitive.Content>
	</DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col gap-1.5 p-6 pb-4 bg-v2-bg-modal-header/50 md:rounded-t-v2-lg border-b border-v2-bg-input-solid",
			className,
		)}
		{...props}
	/>
);
DialogHeader.displayName = "DialogHeader";

const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("flex-1 overflow-y-auto px-6 py-4", className)} {...props} />
);
DialogBody.displayName = "DialogBody";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("flex items-center justify-end gap-3 p-6 pt-4", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn("font-v2-heading text-xl font-semibold text-v2-text-primary", className)}
		{...props}
	/>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description ref={ref} className={cn("text-v2-text-secondary text-base", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
