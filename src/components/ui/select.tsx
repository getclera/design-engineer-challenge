"use client";

import { CaretDown, Check } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Checkbox } from "@v2/components/ui/checkbox";
import { Input } from "@v2/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@v2/components/ui/popover";
import { cn } from "@v2/lib/utils";
import { Select as SelectPrimitive } from "radix-ui";
import * as React from "react";

type SelectTriggerTone = "grey" | "warm";
type SelectTriggerSize = "default" | "compact";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
		tone?: SelectTriggerTone;
		size?: SelectTriggerSize;
	}
>(({ className, children, tone = "grey", size = "default", ...props }, ref) => (
	<SelectPrimitive.Trigger
		ref={ref}
		className={cn(
			"flex w-full items-center justify-between",
			tone === "grey"
				? "bg-v2-bg-input-solid border border-transparent rounded-v2-md"
				: "bg-v2-bg-input border border-v2-border-warm rounded-v2-md",
			size === "default" && "px-4 py-3 text-base",
			size === "compact" && "gap-1 px-2.5 py-1 text-xs",
			"font-v2-body text-v2-text-body",
			"focus-visible:outline-none focus-visible:border-v2-status-active focus-visible:ring-1 focus-visible:ring-v2-status-active",
			"disabled:cursor-not-allowed disabled:opacity-50",
			"data-[placeholder]:text-v2-text-muted",
			className,
		)}
		{...props}
	>
		<span className="min-w-0 truncate text-left">{children}</span>
		<SelectPrimitive.Icon asChild>
			<CaretDown className={cn("shrink-0 text-v2-text-secondary", size === "compact" ? "size-3" : "size-4")} />
		</SelectPrimitive.Icon>
	</SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
	<SelectPrimitive.Portal>
		<SelectPrimitive.Content
			ref={ref}
			position={position}
			className={cn(
				"relative z-50 overflow-hidden",
				"rounded-v2-md border border-v2-border-warm bg-v2-bg-warm shadow-v2-content",
				"max-h-80 min-w-32",
				"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
				"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
				"data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
				"data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
				position === "popper" && "translate-y-1",
				className,
			)}
			{...props}
		>
			<SelectPrimitive.Viewport
				className={cn(
					"p-1",
					position === "popper" && "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)",
				)}
			>
				{children}
			</SelectPrimitive.Viewport>
		</SelectPrimitive.Content>
	</SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
		size?: "default" | "compact";
		hideIndicator?: boolean;
		trailing?: React.ReactNode;
	}
>(({ className, children, size = "default", hideIndicator = false, trailing, ...props }, ref) => (
	<SelectPrimitive.Item
		ref={ref}
		className={cn(
			"relative flex w-full cursor-default select-none items-center rounded-v2-sm",
			size === "default" && cn("py-2 pr-3 text-base", hideIndicator ? "pl-3" : "pl-8"),
			size === "compact" && cn("py-1 pr-2 text-xs", hideIndicator ? "pl-2" : "pl-5"),
			"font-v2-body text-v2-text-body outline-none",
			"focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-v2-brand-teal/60",
			"data-[highlighted]:ring-2 data-[highlighted]:ring-inset data-[highlighted]:ring-v2-brand-teal/60",
			"data-[highlighted]:bg-black/[0.04]",
			hideIndicator && "data-[state=checked]:bg-black/[0.06]",
			trailing && "justify-between gap-2",
			"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
			className,
		)}
		{...props}
	>
		{!hideIndicator && (
			<span
				className={cn(
					"absolute flex items-center justify-center",
					size === "compact" ? "left-1 size-3" : "left-2 size-4",
				)}
			>
				<SelectPrimitive.ItemIndicator>
					<Check className={cn("text-v2-status-active", size === "compact" ? "size-3" : "size-4")} />
				</SelectPrimitive.ItemIndicator>
			</span>
		)}
		<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		{trailing}
	</SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Separator ref={ref} className={cn("my-1 h-px bg-v2-border-divider", className)} {...props} />
));
SelectSeparator.displayName = "SelectSeparator";

const SelectLabel = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Label
		ref={ref}
		className={cn("px-8 py-1.5 font-v2-body text-sm font-medium text-v2-text-secondary", className)}
		{...props}
	/>
));
SelectLabel.displayName = "SelectLabel";

function SelectMultiOption({
	label,
	displayLabel,
	checked,
	size,
	onToggle,
}: {
	label: string;
	displayLabel?: string;
	checked: boolean | "indeterminate";
	size: SelectTriggerSize;
	onToggle: (v: string) => void;
}) {
	return (
		<div
			role="option"
			aria-selected={checked === true}
			onClick={() => onToggle(label)}
			onKeyDown={(e) => e.key === "Enter" && onToggle(label)}
			tabIndex={0}
			className={cn(
				"flex w-full cursor-default items-center gap-2 rounded-v2-sm px-2 font-v2-body text-v2-text-body outline-none",
				"hover:bg-black/[0.04]",
				size === "compact" ? "py-1 text-xs" : "py-2 text-base",
			)}
		>
			<Checkbox checked={checked} className="pointer-events-none size-3.5" />
			{displayLabel ?? label}
		</div>
	);
}

interface SelectMultiProps {
	value: string[];
	onValueChange: (next: string[]) => void;
	options: readonly string[];
	placeholder?: string;
	tone?: SelectTriggerTone;
	size?: SelectTriggerSize;
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	searchPlaceholder?: string;
	formatLabel?: (v: string) => string;
	className?: string;
	creatable?: boolean;
	selectAll?: boolean;
	loading?: boolean;
	emptyMessage?: string;
}

function SelectMulti({
	value,
	onValueChange,
	options,
	placeholder = "Not set",
	tone = "warm",
	size = "compact",
	searchValue,
	onSearchChange,
	searchPlaceholder = "Search...",
	formatLabel,
	className,
	creatable,
	selectAll,
	loading,
	emptyMessage,
}: SelectMultiProps) {
	const [localSearch, setLocalSearch] = React.useState("");
	const pinnedRef = React.useRef<string[]>(value);
	const searchable = onSearchChange !== undefined;
	const currentSearch = searchable ? (searchValue ?? "") : localSearch;
	const setCurrentSearch = searchable ? onSearchChange : setLocalSearch;

	const toggle = (item: string) => {
		onValueChange(value.includes(item) ? value.filter((v) => v !== item) : [...value, item]);
	};

	const { allSelected, someSelected } = React.useMemo(() => {
		const all = options.length > 0 && options.every((o) => value.includes(o));
		return { allSelected: all, someSelected: !all && options.some((o) => value.includes(o)) };
	}, [options, value]);
	const toggleAll = () => {
		onValueChange(allSelected ? value.filter((v) => !options.includes(v)) : [...new Set([...value, ...options])]);
	};

	const trimmedSearch = currentSearch.trim();
	const canCreate =
		creatable &&
		trimmedSearch.length > 0 &&
		!options.some((o) => o.toLowerCase() === trimmedSearch.toLowerCase()) &&
		!value.some((v) => v.toLowerCase() === trimmedSearch.toLowerCase());

	const createItem = () => {
		if (!canCreate) return;
		onValueChange([...value, trimmedSearch]);
		setCurrentSearch("");
	};

	const label = value.length > 0 ? value.map(formatLabel ?? ((v) => v)).join(", ") : placeholder;
	const isPlaceholder = value.length === 0;

	const pinned = pinnedRef.current;
	const allKnown = React.useMemo(() => [...new Set([...options, ...value])], [options, value]);
	const unpinned = allKnown.filter((o) => !pinned.includes(o));
	const filteredPinned = currentSearch
		? pinned.filter((o) => o.toLowerCase().includes(currentSearch.toLowerCase()))
		: pinned;
	const filteredUnpinned = currentSearch
		? unpinned.filter((o) => o.toLowerCase().includes(currentSearch.toLowerCase()))
		: unpinned;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					className={cn(
						"flex w-full items-center justify-between h-auto",
						tone === "grey"
							? "bg-v2-bg-input-solid border border-transparent rounded-v2-md"
							: "bg-v2-bg-input border border-v2-border-warm rounded-v2-md",
						size === "default" && "px-4 py-3 text-base",
						size === "compact" && "gap-1 px-2.5 py-1 text-xs",
						"font-v2-body text-v2-text-body hover:bg-v2-bg-input",
						isPlaceholder && "text-v2-text-muted",
						className,
					)}
				>
					<span className="truncate">{label}</span>
					<CaretDown className={cn("shrink-0 text-v2-text-secondary", size === "compact" ? "size-3" : "size-4")} />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				sideOffset={4}
				tone="grey"
				className="w-auto min-w-(--radix-popover-trigger-width) overflow-hidden p-0"
			>
				{(searchable || creatable || options.length > 8) && (
					<div className="border-b border-v2-border-warm p-1.5">
						<Input
							type="text"
							value={currentSearch}
							onChange={(e) => setCurrentSearch(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && canCreate) {
									e.preventDefault();
									createItem();
								}
							}}
							placeholder={searchPlaceholder}
							tone="warm"
							inputSize="compact"
							className="border-0 bg-transparent px-1.5 py-1 font-v2-body text-xs outline-none focus-visible:ring-0"
						/>
					</div>
				)}
				<div className="max-h-52 overflow-y-auto p-1">
					{selectAll && !currentSearch && options.length > 0 && (
						<>
							<SelectMultiOption
								label="All"
								checked={allSelected ? true : someSelected ? "indeterminate" : false}
								size={size}
								onToggle={() => toggleAll()}
							/>
							{(filteredPinned.length > 0 || filteredUnpinned.length > 0) && (
								<div className="my-0.5 h-px bg-v2-border-divider" />
							)}
						</>
					)}
					{filteredPinned.length === 0 && filteredUnpinned.length === 0 && !canCreate ? (
						<div className="px-2 py-1.5 font-v2-body text-xs text-v2-text-muted">
							{loading ? "Searching..." : (emptyMessage ?? "No results")}
						</div>
					) : (
						<>
							{filteredPinned.map((opt) => (
								<SelectMultiOption
									key={opt}
									label={opt}
									displayLabel={formatLabel?.(opt)}
									checked={value.includes(opt)}
									size={size}
									onToggle={toggle}
								/>
							))}
							{filteredPinned.length > 0 && filteredUnpinned.length > 0 && (
								<div className="my-0.5 h-px bg-v2-border-divider" />
							)}
							{filteredUnpinned.map((opt) => (
								<SelectMultiOption
									key={opt}
									label={opt}
									displayLabel={formatLabel?.(opt)}
									checked={value.includes(opt)}
									size={size}
									onToggle={toggle}
								/>
							))}
							{canCreate && (
								<>
									{(filteredPinned.length > 0 || filteredUnpinned.length > 0) && (
										<div className="my-0.5 h-px bg-v2-border-divider" />
									)}
									<div
										role="option"
										aria-selected={false}
										onClick={createItem}
										onKeyDown={(e) => e.key === "Enter" && createItem()}
										tabIndex={0}
										className={cn(
											"flex w-full cursor-default items-center gap-2 rounded-v2-sm px-2 font-v2-body text-v2-text-body outline-none",
											"hover:bg-black/[0.04]",
											size === "compact" ? "py-1 text-xs" : "py-2 text-base",
										)}
									>
										<span className="text-v2-text-secondary">Create</span>
										<span className="font-medium">&ldquo;{trimmedSearch}&rdquo;</span>
									</div>
								</>
							)}
						</>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
SelectMulti.displayName = "SelectMulti";

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectMulti,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
