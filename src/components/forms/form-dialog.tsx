"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@v2/components/ui/button";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@v2/components/ui/dialog";
import { useSubmitShortcut } from "@v2/hooks/use-submit-shortcut";
import { cn } from "@v2/lib/utils";
import { useCallback, useEffect, useRef } from "react";
import { type DefaultValues, type FieldValues, type UseFormReturn, useForm } from "react-hook-form";
import type { ZodType } from "zod";
import { focusFirstFieldWithoutSelecting } from "./focus-first-field";
import { warmDialogStyles } from "./form-dialog-styles";
import { Form } from "./form-field";

interface FormDialogProps<T extends FieldValues> {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: React.ReactNode;
	description?: React.ReactNode;
	schema: ZodType<T, T>;
	defaultValues: DefaultValues<NoInfer<T>>;
	onSubmit: (values: T, form: UseFormReturn<T>) => unknown;
	appearance?: "default" | "warm";
	preserveDraftOnClose?: boolean;
	submitLabel: string;
	submittingLabel?: string;
	cancelLabel?: string;
	submitDisabled?: boolean;
	isSubmitting?: boolean;
	contentClassName?: string;
	headerClassName?: string;
	titleClassName?: string;
	bodyClassName?: string;
	footerClassName?: string;
	submitVariant?: "primary" | "destructive";
	buttonSize?: "sm" | "default" | "lg";
	hideCancel?: boolean;
	children: (form: UseFormReturn<T>) => React.ReactNode;
}

function FormDialog<T extends FieldValues>({
	open,
	onOpenChange,
	title,
	description,
	schema,
	defaultValues,
	onSubmit,
	appearance = "default",
	preserveDraftOnClose = false,
	submitLabel,
	submittingLabel = "Saving...",
	cancelLabel = "Cancel",
	submitDisabled,
	isSubmitting,
	submitVariant = "primary",
	contentClassName,
	headerClassName,
	titleClassName,
	bodyClassName,
	footerClassName,
	buttonSize,
	hideCancel,
	children,
}: FormDialogProps<T>) {
	const form = useForm<T>({
		resolver: zodResolver(schema),
		defaultValues,
	});

	const defaultValuesRef = useRef(defaultValues);
	defaultValuesRef.current = defaultValues;

	const onSubmitRef = useRef(onSubmit);
	onSubmitRef.current = onSubmit;

	const prevOpenRef = useRef(open);
	useEffect(() => {
		if (open && !prevOpenRef.current && !preserveDraftOnClose) {
			form.reset(defaultValuesRef.current);
		}
		prevOpenRef.current = open;
	}, [open, preserveDraftOnClose, form]);

	const handleSubmit = useCallback(() => {
		form.handleSubmit(async (values) => {
			await onSubmitRef.current(values, form);
		})();
	}, [form]);

	const handleCancel = useCallback(() => {
		if (!preserveDraftOnClose) form.reset(defaultValuesRef.current);
		onOpenChange(false);
	}, [onOpenChange, preserveDraftOnClose, form]);

	const styles = appearance === "warm" ? warmDialogStyles : undefined;
	const busy = isSubmitting || form.formState.isSubmitting;

	useSubmitShortcut(handleSubmit, open && !busy && !submitDisabled);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"bg-v2-bg-card border-v2-border-default flex flex-col overflow-hidden",
					styles?.content,
					contentClassName,
				)}
				onOpenAutoFocus={focusFirstFieldWithoutSelecting}
			>
				<Form {...form}>
					<form // v2-precheck-ignore raw-html-form
						onSubmit={(e) => {
							e.preventDefault();
							handleSubmit();
						}}
						className="flex min-h-0 flex-1 flex-col max-md:h-dvh"
					>
						<DialogHeader
							className={cn("px-5 pt-8 pb-6 md:px-12 md:pt-12 md:pb-8 bg-transparent", styles?.header, headerClassName)}
						>
							<DialogTitle
								className={cn(
									"font-v2-body text-2xl font-medium tracking-tight text-v2-text-primary md:text-3xl",
									styles?.title,
									titleClassName,
								)}
							>
								{title}
							</DialogTitle>
							{description && (
								<DialogDescription className="font-v2-body text-base leading-snug text-v2-text-secondary">
									{description}
								</DialogDescription>
							)}
						</DialogHeader>

						<DialogBody
							className={cn("flex-1 overflow-y-auto px-5 py-8 md:px-12 md:py-10", styles?.body, bodyClassName)}
						>
							{children(form)}
						</DialogBody>

						<DialogFooter
							className={cn(
								"border-t border-v2-border-default px-5 py-4 md:px-12 md:py-6",
								styles?.footer,
								footerClassName,
							)}
						>
							{!hideCancel && (
								<Button type="button" variant="ghost" onClick={handleCancel} disabled={busy} size={buttonSize}>
									{cancelLabel}
								</Button>
							)}
							<Button
								type="submit"
								variant={submitVariant === "destructive" ? "ghost" : "primary"}
								className={cn(
									"gap-2",
									submitVariant === "destructive" &&
										"bg-v2-status-error text-v2-text-inverse hover:bg-v2-status-error/90",
								)}
								disabled={busy || submitDisabled}
								size={buttonSize}
							>
								{busy ? submittingLabel : submitLabel}
								<kbd className="hidden rounded bg-black/20 px-1 py-0.5 text-2xs leading-none md:inline-block">
									<span>&#8984;</span>
									<span>&#8629;</span>
								</kbd>
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

FormDialog.displayName = "FormDialog";

export { FormDialog, type FormDialogProps };
