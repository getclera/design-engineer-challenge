"use client";

import { X } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { DialogOverlay } from "@v2/components/ui/dialog";
import { cn } from "@v2/lib/utils";
import { Dialog as DialogPrimitive, VisuallyHidden } from "radix-ui";
import { type ReactNode, useCallback } from "react";

interface DetailSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	a11yTitle: string;
	children: ReactNode;
	footer?: ReactNode;
	contentClassName?: string;
}

function DetailSheet({ open, onOpenChange, title, a11yTitle, children, footer, contentClassName }: DetailSheetProps) {
	const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogOverlay />
				<DialogPrimitive.Content
					className={cn(
						"fixed inset-y-0 right-0 z-50 flex h-dvh w-full flex-col overflow-hidden border-l border-v2-border-warm bg-v2-bg-page p-0 duration-300 focus:outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right md:w-[94vw]",
						contentClassName,
					)}
					onEscapeKeyDown={handleClose}
				>
					<VisuallyHidden.Root>
						<DialogPrimitive.Title>{a11yTitle}</DialogPrimitive.Title>
					</VisuallyHidden.Root>

					<div className="flex shrink-0 items-center justify-between border-b border-v2-border-warm bg-v2-bg-card px-4 py-2 sm:px-5">
						<span className="truncate font-v2-heading text-sm font-semibold text-v2-text-primary">{title}</span>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleClose}
							className="flex size-auto items-center gap-1 rounded-v2-md p-1.5 text-v2-text-secondary hover:bg-v2-bg-input-solid"
							aria-label="Close"
						>
							<span className="hidden rounded bg-v2-bg-input-solid px-1.5 py-0.5 font-medium text-2xs text-v2-text-tertiary md:inline-flex">
								Esc
							</span>
							<X size={16} />
						</Button>
					</div>

					<div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
					{footer && <div className="shrink-0 bg-v2-bg-card">{footer}</div>}
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
DetailSheet.displayName = "DetailSheet";

export { DetailSheet, type DetailSheetProps };
