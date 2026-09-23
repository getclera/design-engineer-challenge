"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const MESSAGES: Record<string, string> = {
	insufficient_permissions: "Only organization owners can access settings and members.",
};

export function OrgErrorToast() {
	const searchParams = useSearchParams();
	const shownRef = useRef(false);

	useEffect(() => {
		if (shownRef.current) return;
		const error = searchParams.get("error");
		const message = error ? MESSAGES[error] : undefined;
		if (!message) return;
		shownRef.current = true;
		toast.error(message);
		const params = new URLSearchParams(window.location.search);
		params.delete("error");
		const qs = params.toString();
		window.history.replaceState({}, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
	}, [searchParams]);

	return null;
}

OrgErrorToast.displayName = "OrgErrorToast";
