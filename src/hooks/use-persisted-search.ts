"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SYNC_EVENT = "v2-persisted-search";

function normalize(search: string): string {
	return search.startsWith("?") ? search.slice(1) : search;
}

export function pickParams(searchParams: URLSearchParams | null, paramKeys: readonly string[]): string {
	const picked = new URLSearchParams();
	for (const key of paramKeys) {
		const value = searchParams?.get(key);
		if (value) picked.set(key, value);
	}
	return picked.toString();
}

export function persistSearch(key: string, search: string): void {
	if (typeof window === "undefined") return;
	const value = normalize(search);
	if (value) window.localStorage.setItem(key, value);
	else window.localStorage.removeItem(key);
	window.dispatchEvent(new Event(SYNC_EVENT));
}

export function usePersistedSearch(key?: string): string {
	const [value, setValue] = useState("");

	useEffect(() => {
		if (!key) return;
		const read = () => setValue(window.localStorage.getItem(key) ?? "");
		read();
		window.addEventListener(SYNC_EVENT, read);
		window.addEventListener("storage", read);
		return () => {
			window.removeEventListener(SYNC_EVENT, read);
			window.removeEventListener("storage", read);
		};
	}, [key]);

	return value;
}

export function usePersistFilterParams(storageKey: string, paramKeys?: readonly string[]): void {
	const searchParams = useSearchParams();
	const serialized = paramKeys ? pickParams(searchParams, paramKeys) : (searchParams?.toString() ?? "");
	const isMounted = useRef(false);

	useEffect(() => {
		if (!isMounted.current) {
			isMounted.current = true;
			if (!serialized) return;
		}
		persistSearch(storageKey, serialized);
	}, [storageKey, serialized]);
}
