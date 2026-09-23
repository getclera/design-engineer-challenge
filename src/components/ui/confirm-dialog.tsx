"use client";

import { Button } from "@v2/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@v2/components/ui/dialog";
import type { ReactNode } from "react";
import { useEffect } from "react";

interface ConfirmDialogProps {
	open: boolean;
	onCancel: () => void;
	onConfirm: () => void;
	title: ReactNode;
	children?: ReactNode;
	confirmLabel: string;
	confirmingLabel?: string;
	cancelLabel?: string;
	isPending?: boolean;
	confirmDisabled?: boolean;
	variant?: "primary" | "destructive";
	maxWidth?: string;
}

function ShortcutBadge() {
	return (
		<kbd className="hidden rounded bg-black/20 px-1 py-0.5 text-2xs leading-none md:inline-block">
			<span>&#8984;</span>
			<span>&#8629;</span>
		</kbd>
	);
}
ShortcutBadge.displayName = "ShortcutBadge";

function ConfirmDialog({
	open,
	onCancel,
	onConfirm,
	title,
	children,
	confirmLabel,
	confirmingLabel,
	cancelLabel = "Cancel",
	isPending,
	confirmDisabled = false,
	variant = "primary",
	maxWidth = "sm:max-w-[450px]",
}: ConfirmDialogProps) {
	useEffect(() => {
		if (!open) return;
		function handler(e: KeyboardEvent) {
			if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				if (!isPending && !confirmDisabled) onConfirm();
			}
		}
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [open, isPending, confirmDisabled, onConfirm]);

	const confirmButton =
		variant === "destructive" ? (
			<Button
				variant="ghost"
				className="gap-2 bg-v2-status-error text-v2-text-inverse hover:bg-v2-status-error/90"
				onClick={onConfirm}
				disabled={isPending || confirmDisabled}
			>
				{isPending && confirmingLabel ? confirmingLabel : confirmLabel}
				<ShortcutBadge />
			</Button>
		) : (
			<Button variant="primary" className="gap-2" onClick={onConfirm} disabled={isPending || confirmDisabled}>
				{isPending && confirmingLabel ? confirmingLabel : confirmLabel}
				<ShortcutBadge />
			</Button>
		);

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
			<DialogContent className={maxWidth}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{children && <DialogBody>{children}</DialogBody>}
				<DialogFooter>
					<Button variant="ghost" onClick={onCancel} disabled={isPending}>
						{cancelLabel}
					</Button>
					{confirmButton}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
ConfirmDialog.displayName = "ConfirmDialog";

export { ConfirmDialog, type ConfirmDialogProps };
