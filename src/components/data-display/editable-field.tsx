"use client";

import { PencilSimple } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Input } from "@v2/components/ui/input";
import { Textarea } from "@v2/components/ui/textarea";
import { cn } from "@v2/lib/utils";
import { useRef, useState } from "react";

type EditableFieldType = "text" | "textarea" | "number" | "url";

interface EditableFieldProps {
	value: string | number | boolean | null;
	onChange: (value: string | boolean) => void;
	type?: EditableFieldType;
	placeholder?: string;
	className?: string;
	inputClassName?: string;
	displayClassName?: string;
}

function EditableField({
	value,
	onChange,
	type = "text",
	placeholder,
	className,
	inputClassName,
	displayClassName,
}: EditableFieldProps) {
	const [editing, setEditing] = useState(false);
	const [editValue, setEditValue] = useState("");
	const editRef = useRef<string | null>(null);
	const blurTimeout = useRef<ReturnType<typeof setTimeout>>(null);
	const committedRef = useRef(false);

	const startEditing = () => {
		const initial = String(value ?? "");
		setEditValue(initial);
		editRef.current = initial;
		committedRef.current = false;
		setEditing(true);
	};

	const handleLocalChange = (next: string) => {
		setEditValue(next);
		editRef.current = next;
	};

	const commit = () => {
		if (committedRef.current || editRef.current === null) return;
		committedRef.current = true;
		if (blurTimeout.current) clearTimeout(blurTimeout.current);
		setEditing(false);
		const current = editRef.current;
		if (current !== String(value ?? "")) {
			onChange(current);
		}
	};

	const handleBlur = () => {
		blurTimeout.current = setTimeout(commit, 150);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && type !== "textarea") {
			e.preventDefault();
			commit();
		}
		if (e.key === "Escape") {
			if (blurTimeout.current) clearTimeout(blurTimeout.current);
			committedRef.current = true;
			setEditing(false);
		}
	};

	const display = value != null && value !== "" ? String(value) : "—";

	if (!editing) {
		return (
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={startEditing}
				className={cn(
					type === "textarea" ? "h-auto items-start !overflow-visible" : "h-8",
					"w-full justify-start px-2.5 py-1.5 text-sm text-left group border border-transparent hover:border-v2-border-warm transition-colors",
					className,
				)}
				title="Click to edit"
			>
				<span
					className={cn("whitespace-pre-line flex-1", display === "—" && "text-v2-text-tertiary", displayClassName)}
				>
					{display}
				</span>
				<PencilSimple className="h-3 w-3 text-v2-text-secondary shrink-0" />
			</Button>
		);
	}

	if (type === "textarea") {
		return (
			<Textarea
				value={editValue}
				onChange={(e) => handleLocalChange(e.target.value)}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				textareaSize="compact"
				tone="warm"
				placeholder={placeholder}
				autoFocus
			/>
		);
	}

	return (
		<Input
			value={editValue}
			onChange={(e) => handleLocalChange(e.target.value)}
			onBlur={handleBlur}
			onKeyDown={handleKeyDown}
			inputSize="compact"
			tone="warm"
			type={type === "number" ? "number" : type === "url" ? "url" : undefined}
			placeholder={placeholder}
			className={inputClassName}
			autoFocus
		/>
	);
}

EditableField.displayName = "EditableField";

export type { EditableFieldProps, EditableFieldType };
export { EditableField };
