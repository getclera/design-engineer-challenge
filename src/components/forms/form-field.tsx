"use client";

import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { cn } from "@v2/lib/utils";
import { Slot } from "radix-ui";

const SlotPrimitive = Slot;

import * as React from "react";
import {
	Controller,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
	FormProvider,
	useFormContext,
} from "react-hook-form";

// --- Form (Provider) ---

const Form = FormProvider;

// --- FormField (Controller wrapper with context) ---

type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

function FormField<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ name, ...rest }: ControllerProps<TFieldValues, TName>) {
	return (
		<FormFieldContext.Provider value={{ name }}>
			<Controller name={name} {...rest} />
		</FormFieldContext.Provider>
	);
}

// --- FormItem (generates unique IDs for accessibility) ---

type FormItemContextValue = {
	id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => {
		const id = React.useId();

		return (
			<FormItemContext.Provider value={{ id }}>
				<div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props} />
			</FormItemContext.Provider>
		);
	},
);
FormItem.displayName = "FormItem";

// --- useFormField hook ---

function useFormField() {
	const fieldContext = React.useContext(FormFieldContext);
	const itemContext = React.useContext(FormItemContext);
	const { getFieldState, formState } = useFormContext();

	const fieldState = getFieldState(fieldContext.name, formState);

	const { id } = itemContext;

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState,
	};
}

// --- FormLabel ---

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
	icon?: PhosphorIcon;
	sublabel?: string;
	required?: boolean;
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
	({ className, icon: Icon, sublabel, required, children, ...props }, ref) => {
		const { error, formItemId } = useFormField();

		return (
			<div className="flex items-center gap-1.5">
				{Icon && <Icon className={cn("size-4 shrink-0", error ? "text-v2-status-error" : "text-v2-text-secondary")} />}
				<label
					ref={ref}
					htmlFor={formItemId}
					className={cn(
						"text-sm font-medium font-v2-body",
						error ? "text-v2-status-error" : "text-v2-text-secondary",
						className,
					)}
					{...props}
				>
					{children}
					{required && <span className="text-v2-status-error ml-0.5">*</span>}
				</label>
				{sublabel && <span className="ml-auto text-xs text-v2-text-muted">{sublabel}</span>}
			</div>
		);
	},
);
FormLabel.displayName = "FormLabel";

// --- FormControl (Radix Slot for accessibility binding) ---

const FormControl = React.forwardRef<
	React.ElementRef<typeof SlotPrimitive.Slot>,
	React.ComponentPropsWithoutRef<typeof SlotPrimitive.Slot>
>(({ ...props }, ref) => {
	const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

	return (
		<SlotPrimitive.Slot
			ref={ref}
			id={formItemId}
			aria-describedby={error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId}
			aria-invalid={!!error}
			{...props}
		/>
	);
});
FormControl.displayName = "FormControl";

// --- FormDescription ---

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({ className, ...props }, ref) => {
		const { formDescriptionId } = useFormField();

		return (
			<p
				ref={ref}
				id={formDescriptionId}
				className={cn("text-xs text-v2-text-muted font-v2-body", className)}
				{...props}
			/>
		);
	},
);
FormDescription.displayName = "FormDescription";

// --- FormMessage ---

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({ className, children, ...props }, ref) => {
		const { error, formMessageId } = useFormField();
		const body = error ? String(error.message) : children;

		if (!body) return null;

		return (
			<p
				ref={ref}
				id={formMessageId}
				className={cn("text-xs font-medium text-v2-status-error font-v2-body", className)}
				{...props}
			>
				{body}
			</p>
		);
	},
);
FormMessage.displayName = "FormMessage";

export {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	type FormLabelProps,
	FormMessage,
	useFormField,
};
