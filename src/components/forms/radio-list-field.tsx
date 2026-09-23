"use client";

import { Label } from "@v2/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@v2/components/ui/radio-group";
import { cn } from "@v2/lib/utils";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormFieldGroup } from "./form-field-group";

interface RadioListFieldProps<TFieldValues extends FieldValues> {
	control: Control<TFieldValues>;
	name: FieldPath<TFieldValues>;
	label: string;
	description?: string;
	required?: boolean;
	options: readonly { value: string; label: string; description?: string }[];
	variant?: "list" | "cards" | "rows";
	disabled?: boolean;
	className?: string;
}

function RadioListField<TFieldValues extends FieldValues>({
	control,
	name,
	label,
	description,
	required,
	options,
	variant = "list",
	disabled,
	className,
}: RadioListFieldProps<TFieldValues>) {
	return (
		<FormFieldGroup control={control} name={name} label={label} description={description} required={required}>
			{(field) => (
				<RadioGroup
					aria-label={label}
					disabled={disabled}
					value={typeof field.value === "string" ? field.value : ""}
					onValueChange={field.onChange}
					onBlur={field.onBlur}
					ref={field.ref}
					className={cn("gap-2.5", variant === "cards" && "grid-cols-2 gap-3", className)}
				>
					{options.map((option) => {
						const id = `${name}-${option.value}`;
						return (
							<div key={option.value} className={cn("flex items-center gap-2.5", variant !== "list" && "relative")}>
								<RadioGroupItem
									value={option.value}
									id={id}
									className={cn(
										variant !== "list" && "peer absolute right-4 top-4 pointer-events-none border-v2-text-tertiary",
									)}
								/>
								<Label
									htmlFor={id}
									className={cn(
										"cursor-pointer font-v2-body text-sm font-light text-v2-text-body",
										variant !== "list" &&
											"flex h-full min-h-12 w-full flex-col items-start justify-start gap-1.5 rounded-v2-md border border-v2-border-warm bg-v2-bg-page p-4 pr-10 hover:border-v2-brand-teal/50 peer-data-[state=checked]:border-v2-brand-teal peer-data-[state=checked]:bg-v2-brand-teal/5 peer-focus-visible:ring-2 peer-focus-visible:ring-v2-brand-teal peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
										variant === "cards" && "min-h-24",
									)}
								>
									<span className={cn(variant === "cards" && "font-medium")}>{option.label}</span>
									{option.description && (
										<span className="text-xs font-light leading-relaxed text-v2-text-secondary">
											{option.description}
										</span>
									)}
								</Label>
							</div>
						);
					})}
				</RadioGroup>
			)}
		</FormFieldGroup>
	);
}
RadioListField.displayName = "RadioListField";

export { RadioListField, type RadioListFieldProps };
