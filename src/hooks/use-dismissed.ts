"use client";

import { useCallback, useSyncExternalStore } from "react";
import logger from "@/utils/logger";

const SYNC_EVENT = "clera-dismissed-change";
const dismissedInMemory = new Set<string>();

function subscribe(onChange: () => void): () => void {
	window.addEventListener(SYNC_EVENT, onChange);
	window.addEventListener("storage", onChange);
	return () => {
		window.removeEventListener(SYNC_EVENT, onChange);
		window.removeEventListener("storage", onChange);
	};
}

function readDismissed(storageKey: string): boolean {
	if (dismissedInMemory.has(storageKey)) return true;
	try {
		return localStorage.getItem(storageKey) === "true";
	} catch {
		return false;
	}
}

function persistDismissed(storageKey: string): void {
	try {
		localStorage.setItem(storageKey, "true");
	} catch (error) {
		logger.warn("useDismissed: localStorage write failed, dismissal is in-memory only", {
			storageKey,
			message: error instanceof Error ? error.message : String(error),
		});
	}
}

export function useDismissed(storageKey: string | null): { isDismissed: boolean; dismiss: () => void } {
	const isDismissed = useSyncExternalStore(
		subscribe,
		() => storageKey !== null && readDismissed(storageKey),
		() => false,
	);

	const dismiss = useCallback(() => {
		if (storageKey === null) return;
		dismissedInMemory.add(storageKey);
		persistDismissed(storageKey);
		window.dispatchEvent(new Event(SYNC_EVENT));
	}, [storageKey]);

	return { isDismissed, dismiss };
}
