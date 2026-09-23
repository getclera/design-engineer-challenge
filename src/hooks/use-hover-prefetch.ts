"use client";

import { useCallback, useEffect, useRef } from "react";

export const HOVER_PREFETCH_DELAY_MS = 200;

export function useHoverPrefetch(prefetch: () => void, delayMs: number = HOVER_PREFETCH_DELAY_MS) {
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleMouseEnter = useCallback(() => {
		timeoutRef.current = setTimeout(prefetch, delayMs);
	}, [prefetch, delayMs]);

	const handleMouseLeave = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	useEffect(
		() => () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		},
		[],
	);

	return { handleMouseEnter, handleMouseLeave };
}
