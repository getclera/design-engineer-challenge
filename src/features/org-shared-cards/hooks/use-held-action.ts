"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const HELD_ACTION_WINDOW_MS = 3_000;

export function useHeldAction<T>(commit: (payload: T) => void, windowMs: number = HELD_ACTION_WINDOW_MS) {
	const [held, setHeld] = useState<T | null>(null);
	const heldRef = useRef<T | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const commitRef = useRef(commit);
	commitRef.current = commit;

	const release = useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = null;
		const current = heldRef.current;
		heldRef.current = null;
		if (current) setHeld(null);
		return current;
	}, []);

	const flush = useCallback(() => {
		const current = release();
		if (current) commitRef.current(current);
	}, [release]);

	const hold = useCallback(
		(payload: T) => {
			flush();
			heldRef.current = payload;
			setHeld(payload);
			timerRef.current = setTimeout(flush, windowMs);
		},
		[flush, windowMs],
	);

	const cancel = useCallback(
		(matches?: (payload: T) => boolean) => {
			const current = heldRef.current;
			if (!current || (matches && !matches(current))) return null;
			return release();
		},
		[release],
	);

	useEffect(() => {
		const onVisibilityChange = () => {
			if (document.visibilityState === "hidden") flush();
		};
		document.addEventListener("visibilitychange", onVisibilityChange);
		window.addEventListener("pagehide", flush);
		return () => {
			document.removeEventListener("visibilitychange", onVisibilityChange);
			window.removeEventListener("pagehide", flush);
			flush();
		};
	}, [flush]);

	return { held, hold, flush, cancel };
}
