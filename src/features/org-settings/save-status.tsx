"use client";

import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";
import { toast } from "sonner";

// One status for the whole Settings page: any save in flight → "Saving…", any failure → says so until the next save.
let pending = 0;
let failed = false;
// Typed but not sent yet (autosave waits for a pause): already "Saving…", so nobody leaves thinking it's done.
const dirty = new Set<string>();
const listeners = new Set<() => void>();
const emit = () => {
	for (const listener of listeners) listener();
};
const subscribe = (listener: () => void) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};
const snapshot = () => (pending > 0 || dirty.size > 0 ? "saving" : failed ? "failed" : "saved");

export function markDirty(key: string, isDirty: boolean) {
	if (isDirty === dirty.has(key)) return;
	if (isDirty) dirty.add(key);
	else dirty.delete(key);
	emit();
}

/** Wrap every Settings save, so the header can say "Saving…" or "All changes saved". */
export async function trackSave<T>(promise: Promise<T>): Promise<T> {
	pending++;
	failed = false;
	emit();
	try {
		return await promise;
	} catch (error) {
		failed = true;
		throw error;
	} finally {
		pending--;
		emit();
	}
}

export function SaveStatus() {
	const status = useSyncExternalStore(subscribe, snapshot, () => "saved" as const);
	return (
		<p role="status" className="flex items-center gap-1.5 font-v2-body text-v2-text-tertiary text-xs">
			{status === "saving" ? (
				<>
					<span className="size-1.5 animate-pulse rounded-full bg-v2-status-warning motion-reduce:animate-none" />
					Saving…
				</>
			) : status === "failed" ? (
				<>
					<WarningCircle size={14} className="text-v2-status-warning" />
					Couldn't save one change
				</>
			) : (
				<>
					<CheckCircle size={14} className="text-v2-text-brand-green" />
					All changes saved
				</>
			)}
		</p>
	);
}

SaveStatus.displayName = "SaveStatus";

const UNDO_MS = 5000;

/** A 5-second toast with Undo, like Review's decision toasts. */
export function undoToast(message: string, undo: () => void) {
	const id = toast.success(message, {
		duration: UNDO_MS,
		className: "toast-timer",
		style: { "--toast-ms": `${UNDO_MS}ms` } as CSSProperties,
		action: {
			label: "Undo",
			onClick: () => {
				toast.dismiss(id);
				undo();
			},
		},
	});
}

export { UNDO_MS };
