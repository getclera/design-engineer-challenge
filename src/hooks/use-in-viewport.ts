"use client";

import { useEffect, useRef } from "react";

interface UseInViewportParams {
	onEnter: () => void;
	rootMargin?: string;
	threshold?: number;
}

function useInViewport<T extends HTMLElement = HTMLElement>({
	onEnter,
	rootMargin = "200px",
	threshold = 0,
}: UseInViewportParams) {
	const nodeRef = useRef<T>(null);
	const firedRef = useRef(false);
	const onEnterRef = useRef(onEnter);
	onEnterRef.current = onEnter;

	useEffect(() => {
		const node = nodeRef.current;
		if (firedRef.current || !node || typeof IntersectionObserver !== "function") return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry?.isIntersecting || firedRef.current) return;
				firedRef.current = true;
				observer.disconnect();
				onEnterRef.current();
			},
			{ rootMargin, threshold },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [rootMargin, threshold]);

	return nodeRef;
}

export { useInViewport };
