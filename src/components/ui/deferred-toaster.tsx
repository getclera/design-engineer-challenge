"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const V2Toaster = dynamic(() => import("./toaster").then((m) => m.V2Toaster), { ssr: false });

export function DeferredToaster() {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (ready) return;
		const trigger = () => setReady(true);
		const options = { once: true, passive: true } as const;
		window.addEventListener("pointerdown", trigger, options);
		window.addEventListener("keydown", trigger, options);
		return () => {
			window.removeEventListener("pointerdown", trigger);
			window.removeEventListener("keydown", trigger);
		};
	}, [ready]);

	return ready ? <V2Toaster /> : null;
}
DeferredToaster.displayName = "DeferredToaster";
