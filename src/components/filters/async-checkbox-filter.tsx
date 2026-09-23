"use client";

import { useQuery } from "@tanstack/react-query";
import { Input } from "@v2/components/ui/input";
import { useDebouncedValue } from "@v2/hooks/use-debounced-value";
import { useMemo, useState } from "react";
import { miscKeys } from "@/lib/query-keys";
import { CheckboxRow } from "./checkbox-row";
import type { CheckboxFilterProps, FilterOption } from "./types";

interface AsyncCheckboxFilterProps extends CheckboxFilterProps {
	loadOptions: NonNullable<CheckboxFilterProps["loadOptions"]>;
}

function AsyncCheckboxFilter({
	selected,
	onChange,
	loadOptions,
	renderOption,
	emptyMessage = "No results",
	maxHeight = 224,
	minQueryLength = 2,
	debounceMs = 250,
	selectedLabels,
	cacheKey,
	idlePlaceholder = "Type to search…",
}: AsyncCheckboxFilterProps) {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebouncedValue(search.trim(), debounceMs);

	const enabled = debouncedSearch.length >= minQueryLength;

	const { data, isFetching, isError } = useQuery({
		queryKey: miscKeys.asyncFilterSuggest(cacheKey ?? "anonymous", debouncedSearch),
		queryFn: ({ signal }) => loadOptions(debouncedSearch, signal),
		enabled,
		staleTime: 30_000,
	});

	const remoteOptions = data ?? [];

	const selectedOptions = useMemo<FilterOption[]>(() => {
		const remoteByValue = new Map(remoteOptions.map((o) => [o.value, o]));
		return selected.map((value) => {
			const remote = remoteByValue.get(value);
			if (remote) return remote;
			return { value, label: selectedLabels?.[value] ?? value };
		});
	}, [remoteOptions, selected, selectedLabels]);

	const newRemoteOptions = useMemo<FilterOption[]>(() => {
		const selectedSet = new Set(selected);
		return remoteOptions.filter((o) => !selectedSet.has(o.value));
	}, [remoteOptions, selected]);

	const toggle = (value: string) => {
		if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
		else onChange([...selected, value]);
	};

	const showResults = enabled;
	const showIdleHint = !showResults && selected.length === 0;
	const showEmpty = showResults && !isFetching && !isError && newRemoteOptions.length === 0;

	return (
		<div className="space-y-2.5">
			<Input
				tone="grey"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder={idlePlaceholder}
				aria-label="Search options"
				className="h-7 px-2.5 py-1 text-xs"
			/>

			<div
				className="-mx-1 flex max-h-(--max-height) flex-col gap-px overflow-y-auto px-1"
				style={{ "--max-height": `${maxHeight}px` }}
			>
				{selectedOptions.length > 0 ? (
					<div className="flex flex-col gap-px border-b border-v2-border-warm-soft pb-1.5">
						{selectedOptions.map((opt) => (
							<CheckboxRow key={opt.value} opt={opt} checked onToggle={toggle} renderOption={renderOption} />
						))}
					</div>
				) : null}

				{showIdleHint && <div className="py-3 text-center text-xs text-v2-text-muted">Start typing to search…</div>}

				{showResults && isFetching ? (
					<output className="flex items-center justify-center gap-1.5 py-3" aria-label="Loading suggestions">
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
				) : null}

				{showResults && !isFetching && isError ? (
					<div className="py-3 text-center text-xs text-v2-text-muted">Failed to load suggestions</div>
				) : null}

				{showEmpty ? <div className="py-3 text-center text-xs text-v2-text-muted">{emptyMessage}</div> : null}

				{showResults && !isFetching && !isError && newRemoteOptions.length > 0 ? (
					<div className="flex flex-col gap-px pt-0.5">
						{newRemoteOptions.map((opt) => (
							<CheckboxRow key={opt.value} opt={opt} checked={false} onToggle={toggle} renderOption={renderOption} />
						))}
					</div>
				) : null}
			</div>
		</div>
	);
}
AsyncCheckboxFilter.displayName = "AsyncCheckboxFilter";

export { AsyncCheckboxFilter };
