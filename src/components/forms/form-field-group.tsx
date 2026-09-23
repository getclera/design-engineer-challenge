"use client";

import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { cn } from "@v2/lib/utils";
import type * as React from "react";
import type { Control, ControllerFieldState, ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form-field";

interface FormFieldGroupProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
	control: Control<TFieldValues>;
	name: TName;
	label: string;
	icon?: PhosphorIcon;
	sublabel?: string;
	description?: string;
	required?: boolean;
	className?: string;
	children: (field: ControllerRenderProps<TFieldValues, TName>, fieldState: ControllerFieldState) => React.ReactNode;
}

function FormFieldGroup<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	control,
	name,
	label,
	icon,
	sublabel,
	description,
	required,
	className,
	children,
}: FormFieldGroupProps<TFieldValues, TName>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<FormItem className={cn(className)}>
					<FormLabel icon={icon} sublabel={sublabel} required={required}>
						{label}
					</FormLabel>
					<FormControl>{children(field, fieldState)}</FormControl>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
FormFieldGroup.displayName = "FormFieldGroup";

export { FormFieldGroup, type FormFieldGroupProps };
