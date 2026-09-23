"use client";

import { Checkbox } from "@v2/components/ui/checkbox";
import { Label } from "@v2/components/ui/label";
import { cn } from "@v2/lib/utils";
import type { ReactNode } from "react";
import type { FilterOption } from "./types";

function getLabel(opt: FilterOption): string {
	return opt.label ?? opt.value;
}

function CountPill({ count, active }: { count: number; active: boolean }) {
	return (
		<span
			className={cn(
				"inline-flex h-4 min-w-4.5 shrink-0 items-center justify-center rounded-full px-1 text-2xs font-medium tabular-nums tracking-wide",
				active
					? "bg-v2-text-brand/15 text-v2-text-brand ring-1 ring-inset ring-v2-text-brand/15"
					: "bg-v2-bg-input-solid text-v2-text-tertiary",
			)}
		>
			{count.toLocaleString()}
		</span>
	);
}

interface CheckboxRowProps {
	opt: FilterOption;
	checked: boolean;
	onToggle: (value: string) => void;
	renderOption?: (option: FilterOption, checked: boolean) => ReactNode;
	offset?: number;
}

function CheckboxRow({ opt, checked, onToggle, renderOption, offset }: CheckboxRowProps) {
	const positioned = offset !== undefined;
	return (
		<Label
			className={cn(
				"group flex w-full cursor-pointer items-center gap-2.5 rounded-v2-md pl-2.5 pr-2 text-xs font-normal leading-none",
				"transition-[background-color,padding-left] duration-150 ease-out",
				"hover:bg-v2-bg-warm hover:pl-3",
				checked && "bg-v2-bg-warm/60",
				positioned ? "absolute left-0 top-0 h-7 translate-y-(--row-start)" : "min-h-7",
			)}
			style={positioned ? { "--row-start": `${offset}px` } : undefined}
		>
			<span
				aria-hidden="true"
				className={cn(
					"absolute left-0 top-1/2 h-3 w-px -translate-y-1/2 rounded-full transition-[height,background-color] duration-200 ease-out",
					checked ? "h-4 bg-v2-text-brand" : "bg-transparent group-hover:h-3 group-hover:bg-v2-border-warm",
				)}
			/>
			<Checkbox checked={checked} onCheckedChange={() => onToggle(opt.value)} aria-label={getLabel(opt)} />
			{renderOption ? (
				renderOption(opt, checked)
			) : (
				<>
					<span
						className={cn(
							"flex-1 truncate transition-colors",
							checked ? "font-medium text-v2-text-primary" : "text-v2-text-primary",
						)}
					>
						{getLabel(opt)}
					</span>
					{typeof opt.count === "number" && <CountPill count={opt.count} active={checked} />}
				</>
			)}
		</Label>
	);
}
CheckboxRow.displayName = "CheckboxRow";

const ROW_HEIGHT = 28;

export { CheckboxRow, getLabel, ROW_HEIGHT };
