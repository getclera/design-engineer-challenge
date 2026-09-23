"use client";

import type { ClerkOauthProvider } from "@clera/auth";
import { useSyncExternalStore } from "react";
import { getCookie, setCookie } from "@/utils/cookies";
import { LAST_LOGIN_METHOD_COOKIE, LAST_LOGIN_METHOD_MAX_AGE_DAYS } from "./constants";

const SYNC_EVENT = "clera-last-login-method";

export type LastLoginMethod = ClerkOauthProvider | "email_code";

const METHODS = ["google", "linkedin_oidc", "email_code"] as const satisfies readonly LastLoginMethod[];

export function parseLastLoginMethod(raw: string | null): LastLoginMethod | null {
	return METHODS.find((method) => method === raw) ?? null;
}

export function saveLastLoginMethod(method: LastLoginMethod): void {
	if (typeof window === "undefined") return;
	setCookie(LAST_LOGIN_METHOD_COOKIE, method, LAST_LOGIN_METHOD_MAX_AGE_DAYS, {
		sameSite: "lax",
		secure: window.location.protocol === "https:",
	});
	window.dispatchEvent(new Event(SYNC_EVENT));
}

function subscribe(onChange: () => void): () => void {
	window.addEventListener(SYNC_EVENT, onChange);
	return () => window.removeEventListener(SYNC_EVENT, onChange);
}

function readLastLoginMethod(): LastLoginMethod | null {
	return parseLastLoginMethod(getCookie(LAST_LOGIN_METHOD_COOKIE));
}

export function useLastLoginMethod(): LastLoginMethod | null {
	return useSyncExternalStore(subscribe, readLastLoginMethod, () => null);
}
