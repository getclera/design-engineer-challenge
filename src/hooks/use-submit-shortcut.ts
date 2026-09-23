"use client";

import { useEffect, useRef } from "react";

function useSubmitShortcut(onSubmit: () => void, enabled = true): void {
	const onSubmitRef = useRef(onSubmit);
	onSubmitRef.current = onSubmit;

	useEffect(() => {
		if (!enabled) return;
		const handler = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
				event.preventDefault();
				onSubmitRef.current();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [enabled]);
}

export { useSubmitShortcut };
