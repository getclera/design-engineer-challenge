"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@v2/components/ui/button";
import { Input } from "@v2/components/ui/input";
import { useMemo, useRef, useState } from "react";
import { AsyncCheckboxFilter } from "./async-checkbox-filter";
import { CheckboxRow, getLabel, ROW_HEIGHT } from "./checkbox-row";
import type { CheckboxFilterProps } from "./types";

const SEARCH_THRESHOLD = 5;

function CheckboxFilter(props: CheckboxFilterProps) {
	if (props.loadOptions) return <AsyncCheckboxFilter {...props} loadOptions={props.loadOptions} />;
	return <StaticCheckboxFilter {...props} />;
}
CheckboxFilter.displayName = "CheckboxFilter";

function StaticCheckboxFilter({
	options,
	selected,
	onChange,
	searchable = true,
	showSelectAll = false,
	emptyMessage = "No results",
	renderOption,
	selectedFirst = true,
	loading = false,
	maxHeight = 224,
	virtualize = true,
}: CheckboxFilterProps) {
	const [search, setSearch] = useState("");
	const scrollRef = useRef<HTMLDivElement | null>(null);

	const initialSelectedRef = useRef<string[] | null>(null);
	if (initialSelectedRef.current === null) initialSelectedRef.current = [...selected];

	const showSearch = searchable && options.length > SEARCH_THRESHOLD;

	const sortedOptions = useMemo(() => {
		const filtered =
			!showSearch || !search
				? options
				: options.filter((opt) => getLabel(opt).toLowerCase().includes(search.toLowerCase()));
		if (!selectedFirst) return filtered;
		const initial = initialSelectedRef.current ?? [];
		const initialSet = new Set(initial);
		return [...filtered].sort((a, b) => {
			if (a.pinned && !b.pinned) return -1;
			if (!a.pinned && b.pinned) return 1;
			const aSel = initialSet.has(a.value);
			const bSel = initialSet.has(b.value);
			if (aSel && !bSel) return -1;
			if (!aSel && bSel) return 1;
			if (aSel && bSel) return initial.indexOf(a.value) - initial.indexOf(b.value);
			if ((a.count ?? 0) !== (b.count ?? 0)) return (b.count ?? 0) - (a.count ?? 0);
			return getLabel(a).localeCompare(getLabel(b));
		});
	}, [options, search, showSearch, selectedFirst]);

	const virtualizer = useVirtualizer({
		count: virtualize ? sortedOptions.length : 0,
		getScrollElement: () => scrollRef.current,
		estimateSize: () => ROW_HEIGHT,
		overscan: 8,
		useFlushSync: false,
	});

	const allSelected = sortedOptions.length > 0 && sortedOptions.every((opt) => selected.includes(opt.value));

	const handleSelectAll = () => {
		const filteredValues = sortedOptions.map((opt) => opt.value);
		const next = [...selected, ...filteredValues.filter((v) => !selected.includes(v))];
		onChange(next);
	};

	const handleDeselectAll = () => {
		onChange([]);
	};

	const toggle = (value: string) => {
		if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
		else onChange([...selected, value]);
	};

	if (loading) {
		return (
			<output className="flex items-center justify-center gap-1.5 py-6" aria-label="Loading filters">
				{[0, 1, 2].map((i) => (
					<span
						key={i}
						className={
							"size-1.5 rounded-full bg-v2-text-tertiary/60 animate-pulse animation-delay-(--delay) animation-duration-1200" // v2-precheck-ignore animate-pulse
						}
						style={{ "--delay": `${i * 160}ms` }}
					/>
				))}
			</output>
		);
	}

	return (
		<div className="space-y-2.5">
			{showSearch && (
				<Input
					tone="grey"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search…"
					aria-label="Search options"
					className="h-7 px-2.5 py-1 text-xs"
				/>
			)}

			{showSelectAll && (sortedOptions.length > 1 || selected.length > 0) && (
				<div className="flex gap-1">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-6 px-2 text-2xs font-normal"
						onClick={handleSelectAll}
						disabled={allSelected}
					>
						Select all
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-6 px-2 text-2xs font-normal"
						onClick={handleDeselectAll}
						disabled={selected.length === 0}
					>
						Deselect all
					</Button>
				</div>
			)}

			{sortedOptions.length === 0 ? (
				<div className="py-3 text-center text-xs text-v2-text-muted">{emptyMessage}</div>
			) : virtualize ? (
				<div
					ref={scrollRef}
					className="-mx-1 h-(--list-height) max-h-(--max-height) overflow-y-auto px-1"
					style={{
						"--max-height": `${maxHeight}px`,
						"--list-height": `${Math.min(maxHeight, sortedOptions.length * ROW_HEIGHT)}px`,
					}}
				>
					<div
						className="relative h-(--total-height) w-full"
						style={{ "--total-height": `${virtualizer.getTotalSize()}px` }}
					>
						{virtualizer.getVirtualItems().map((virtualRow) => {
							const opt = sortedOptions[virtualRow.index];
							return (
								<CheckboxRow
									key={opt.value}
									opt={opt}
									checked={selected.includes(opt.value)}
									onToggle={toggle}
									renderOption={renderOption}
									offset={virtualRow.start}
								/>
							);
						})}
					</div>
				</div>
			) : (
				<div
					className="-mx-1 flex max-h-(--max-height) flex-col gap-px overflow-y-auto px-1"
					style={{ "--max-height": `${maxHeight}px` }}
				>
					{sortedOptions.map((opt) => (
						<CheckboxRow
							key={opt.value}
							opt={opt}
							checked={selected.includes(opt.value)}
							onToggle={toggle}
							renderOption={renderOption}
						/>
					))}
				</div>
			)}
		</div>
	);
}
StaticCheckboxFilter.displayName = "StaticCheckboxFilter";

export { CheckboxFilter };
