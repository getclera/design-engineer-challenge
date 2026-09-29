"use client";

import { useSyncExternalStore } from "react";

// Letter and number shortcuts (M, Z, L, ?, 1–9) can be switched off, for people whose speech input or
// screen reader sends single keys. Arrows, Enter, Backspace and Esc always work. One setting for Home and Review.
const KEY = "clera-single-keys";
const listeners = new Set<() => void>();

export function singleKeysOn(): boolean {
	try {
		return localStorage.getItem(KEY) !== "off";
	} catch {
		return true;
	}
}

/** A printable key (letter, digit, symbol) that a shortcut would use; Space is left to buttons and the profile. */
export const isSingleKey = (e: KeyboardEvent) => e.key.length === 1 && e.key !== " ";

export function setSingleKeys(on: boolean) {
	try {
		localStorage.setItem(KEY, on ? "on" : "off");
	} catch {}
	for (const listener of listeners) listener();
}

export function useSingleKeys(): boolean {
	return useSyncExternalStore(
		(listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		singleKeysOn,
		() => true,
	);
}
