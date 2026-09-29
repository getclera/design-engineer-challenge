"use client";

import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";
import { toast } from "sonner";

// One status for the whole Settings page: any save in flight → "Saving…"; a failure stays until that same change
// saves (another field saving fine must never turn it into "All changes saved").
let pending = 0;
const failed = new Set<string>();
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
const snapshot = () => (pending > 0 || dirty.size > 0 ? "saving" : failed.size > 0 ? `failed:${failed.size}` : "saved");

export function markDirty(key: string, isDirty: boolean) {
	if (isDirty === dirty.has(key)) return;
	if (isDirty) dirty.add(key);
	else dirty.delete(key);
	emit();
}

/** Wrap every Settings save, so the header can say "Saving…" or "All changes saved". `key` names the change (a field). */
export async function trackSave<T>(promise: Promise<T>, key = "other"): Promise<T> {
	pending++;
	emit();
	try {
		const result = await promise;
		failed.delete(key);
		return result;
	} catch (error) {
		failed.add(key);
		throw error;
	} finally {
		pending--;
		emit();
	}
}

export function SaveStatus() {
	const status = useSyncExternalStore(subscribe, snapshot, () => "saved");
	return (
		<p role="status" className="flex items-center gap-1.5 font-v2-body text-v2-text-tertiary text-xs">
			{status === "saving" ? (
				<>
					<span className="size-1.5 animate-pulse rounded-full bg-v2-status-warning motion-reduce:animate-none" />
					Saving…
				</>
			) : status.startsWith("failed") ? (
				<>
					<WarningCircle size={14} className="text-v2-status-warning" />
					{status === "failed:1" ? "Couldn't save one change" : `Couldn't save ${status.slice(7)} changes`}
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
