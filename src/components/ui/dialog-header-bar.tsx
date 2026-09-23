"use client";

import { X } from "@phosphor-icons/react";
import { cn } from "@v2/lib/utils";
import type { ReactNode } from "react";
import { Button } from "./button";
import { DialogTitle } from "./dialog";

interface DialogHeaderBarProps {
	title: ReactNode;
	onClose: () => void;
	closeDisabled?: boolean;
	className?: string;
}

function DialogHeaderBar({ title, onClose, closeDisabled, className }: DialogHeaderBarProps) {
	return (
		<div
			className={cn(
				"flex shrink-0 items-center justify-between border-b border-v2-border-divider px-5 py-4",
				className,
			)}
		>
			<DialogTitle className="flex items-center gap-2 font-v2-body text-base font-semibold text-v2-text-primary">
				{title}
			</DialogTitle>
			<Button
				type="button"
				variant="unstyled"
				size="unstyled"
				onClick={onClose}
				disabled={closeDisabled}
				aria-label="Close dialog"
				className="flex items-center gap-1.5 font-v2-body text-xs text-v2-text-tertiary transition-colors hover:text-v2-text-primary"
			>
				<span className="rounded bg-v2-bg-warm px-1.5 py-0.5 text-2xs font-medium">Esc</span>
				<X className="size-4" />
			</Button>
		</div>
	);
}
DialogHeaderBar.displayName = "DialogHeaderBar";

export { DialogHeaderBar };
