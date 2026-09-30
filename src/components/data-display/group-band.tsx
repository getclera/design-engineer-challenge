"use client";

import { CaretRight } from "@phosphor-icons/react";
import { cn } from "@v2/lib/utils";
import { useCallback, useMemo, useSyncExternalStore } from "react";

interface GroupBandProps {
	title: string;
	count?: number;
	open: boolean;
	onToggle: () => void;
	/** Stays at the top of its scroll area (Review's list). */
	sticky?: boolean;
	/** Id of the rows it shows and hides. */
	controls?: string;
	className?: string;
}

/** A list's group header ("Asked to meet you · 4") that opens and closes its rows. */
export function GroupBand({ title, count, open, onToggle, sticky = false, controls, className }: GroupBandProps) {
	return (
		<button
			type="button"
			onClick={onToggle}
			aria-expanded={open}
			aria-controls={controls}
			className={cn(
				"flex w-full items-center gap-1.5 bg-v2-bg-warm px-4 py-1.5 text-left font-medium font-v2-body text-2xs text-v2-text-tertiary uppercase tracking-wider transition-colors hover:text-v2-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal focus-visible:ring-inset max-lg:px-3",
				sticky && "sticky top-0 z-1",
				className,
			)}
		>
			<CaretRight
				size={10}
				weight="bold"
				aria-hidden="true"
				className={cn("shrink-0 transition-transform duration-150 motion-reduce:transition-none", open && "rotate-90")}
			/>
			<span className="min-w-0 flex-1 truncate">{title}</span>
			{count !== undefined && <span className="tabular-nums">{count}</span>}
		</button>
	);
}

GroupBand.displayName = "GroupBand";

// Closed groups, per storage key, remembered in this browser. Storage can be missing or blocked: then nothing is remembered.
const listeners = new Set<() => void>();
const cache = new Map<string, string>();
const EMPTY = "[]";

function read(storageKey: string): string {
	if (!cache.has(storageKey)) {
		let stored = EMPTY;
		try {
			stored = localStorage.getItem(storageKey) ?? EMPTY;
		} catch {}
		cache.set(storageKey, stored);
	}
	return cache.get(storageKey) ?? EMPTY;
}

const subscribe = (listener: () => void) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};

/** Which groups are closed, remembered per browser. On the server every group is open, so nothing mismatches. */
export function useCollapsedGroups(storageKey: string) {
	const raw = useSyncExternalStore(
		subscribe,
		() => read(storageKey),
		() => EMPTY,
	);
	const closed = useMemo(() => parseKeys(raw), [raw]);
	const isOpen = useCallback((key: string) => !closed.includes(key), [closed]);
	const toggle = useCallback(
		(key: string) => {
			const current = parseKeys(read(storageKey));
			const next = JSON.stringify(current.includes(key) ? current.filter((k) => k !== key) : [...current, key]);
			cache.set(storageKey, next);
			try {
				localStorage.setItem(storageKey, next);
			} catch {}
			for (const listener of listeners) listener();
		},
		[storageKey],
	);
	return { isOpen, toggle };
}

function parseKeys(raw: string): string[] {
	try {
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : [];
	} catch {
		return [];
	}
}
