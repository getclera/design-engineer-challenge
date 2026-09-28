"use client";

import { Check } from "@phosphor-icons/react";
import { Tag } from "@v2/components/ui/tag";
import { cn } from "@v2/lib/utils";
import { type KeyboardEvent, type ReactNode, useEffect, useState } from "react";
import { undoToast } from "./save-status";

/**
 * The same look for every Settings input: quiet at rest, teal ring when focused, red when it can't be saved.
 * 16px on phones, or iOS zooms the page when a field gets focus.
 */
export const FIELD_CLASSES =
	"w-full rounded-v2-md border border-transparent bg-v2-bg-input-solid px-3 py-2 font-v2-body text-sm text-v2-text-body outline-none max-sm:text-base transition-[border-color,background-color,box-shadow] placeholder:text-v2-text-muted hover:border-v2-border-divider focus:border-v2-status-active focus:bg-v2-bg-card focus:ring-3 focus:ring-v2-status-active/15 read-only:cursor-default read-only:hover:border-transparent aria-invalid:border-v2-status-error";

/** Label row: the label, an optional note on the right, and a brief "Saved" after each save. */
export function FieldLabel({
	htmlFor,
	children,
	note,
	savedAt,
}: {
	htmlFor?: string;
	children: ReactNode;
	note?: ReactNode;
	savedAt?: number;
}) {
	return (
		<div className="flex items-baseline gap-2 font-medium font-v2-body text-v2-text-secondary text-xs">
			{htmlFor ? <label htmlFor={htmlFor}>{children}</label> : <span>{children}</span>}
			{note && <span className="font-normal text-v2-text-tertiary tabular-nums">{note}</span>}
			<SavedTick at={savedAt} />
		</div>
	);
}

function SavedTick({ at }: { at?: number }) {
	const [shown, setShown] = useState<number | undefined>();
	useEffect(() => {
		if (!at) return;
		setShown(at);
		const timer = setTimeout(() => setShown(undefined), 1600);
		return () => clearTimeout(timer);
	}, [at]);
	return (
		<span
			aria-hidden={!shown}
			className={cn(
				"ml-auto inline-flex items-center gap-1 font-normal text-2xs text-v2-brand-green transition-opacity duration-300",
				shown ? "opacity-100" : "opacity-0",
			)}
		>
			<Check size={11} weight="bold" /> Saved
		</span>
	);
}

export function FieldError({ id, children }: { id: string; children?: string }) {
	if (!children) return null;
	return (
		<p id={id} role="alert" className="font-v2-body text-v2-status-error text-xs">
			{children}
		</p>
	);
}

/** One choice out of a few (company size, stage): buttons, so each option is one click and one Tab stop. */
export function ChoiceChips<T extends string>({
	label,
	options,
	value,
	onChange,
	readOnly,
	id,
}: {
	label: string;
	options: readonly T[];
	value: T | null;
	onChange: (value: T) => void;
	readOnly?: boolean;
	id?: string;
}) {
	return (
		<fieldset id={id} aria-label={label} className="m-0 flex min-w-0 flex-wrap gap-1.5 border-0 p-0">
			{options.map((option) => (
				<button
					key={option}
					type="button"
					aria-pressed={value === option}
					disabled={readOnly && value !== option}
					onClick={() => !readOnly && onChange(option)}
					className={cn(
						"rounded-v2-md border px-3 py-1.5 font-v2-body text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal",
						value === option
							? "border-v2-status-active bg-v2-status-success-bg font-medium text-v2-text-primary"
							: "border-v2-border-divider bg-v2-bg-card text-v2-text-secondary hover:border-v2-border-default hover:text-v2-text-primary",
						readOnly && "cursor-default disabled:opacity-60",
					)}
				>
					{option}
				</button>
			))}
		</fieldset>
	);
}

/** A list of short things (cities, benefits, stack): Enter adds, Backspace on empty removes the last, × removes with Undo. */
export function TagInput({
	id,
	label,
	values,
	onChange,
	placeholder,
	readOnly,
}: {
	id: string;
	label: string;
	values: string[];
	onChange: (values: string[]) => void;
	placeholder: string;
	readOnly?: boolean;
}) {
	const [draft, setDraft] = useState("");
	const remove = (index: number) => {
		const removed = values[index];
		onChange(values.filter((_, i) => i !== index));
		undoToast(`Removed “${removed}”`, () => onChange(values));
	};
	const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if ((e.key === "Enter" || e.key === ",") && draft.trim()) {
			e.preventDefault();
			const value = draft.trim();
			if (!values.some((v) => v.toLowerCase() === value.toLowerCase())) onChange([...values, value]);
			setDraft("");
		} else if (e.key === "Backspace" && !draft && values.length) remove(values.length - 1);
	};
	return (
		<div
			className={cn(
				"flex min-h-10.5 flex-wrap items-center gap-1.5 rounded-v2-md border border-transparent bg-v2-bg-input-solid p-1.5 transition-[border-color,background-color,box-shadow]",
				!readOnly &&
					"focus-within:border-v2-status-active focus-within:bg-v2-bg-card focus-within:ring-3 focus-within:ring-v2-status-active/15",
			)}
		>
			{values.map((value, index) => (
				<Tag
					key={value}
					className="h-7 animate-in bg-v2-bg-card px-2.5 text-sm shadow-xs fade-in zoom-in-95 motion-reduce:animate-none"
					onDismiss={readOnly ? undefined : () => remove(index)}
					dismissLabel={`Remove ${value}`}
				>
					{value}
				</Tag>
			))}
			{!readOnly && (
				<input
					id={id}
					aria-label={label}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={onKeyDown}
					onBlur={() => {
						const value = draft.trim();
						if (value && !values.some((v) => v.toLowerCase() === value.toLowerCase())) onChange([...values, value]);
						setDraft("");
					}}
					placeholder={values.length ? "Add another" : placeholder}
					className="min-w-28 flex-1 bg-transparent px-1.5 py-1 font-v2-body text-sm text-v2-text-body max-sm:text-base outline-none placeholder:text-v2-text-muted"
				/>
			)}
		</div>
	);
}
