"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";

const STORAGE_KEY = "v2-theme";
const DARK_VALUE = "dark";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

let sessionPreference: boolean | null = null;

function readPreference(): boolean {
	if (typeof window === "undefined") return false;
	if (sessionPreference !== null) return sessionPreference;
	try {
		return window.localStorage.getItem(STORAGE_KEY) === DARK_VALUE;
	} catch {
		return false;
	}
}

function persistPreference(dark: boolean): void {
	sessionPreference = dark;
	try {
		window.localStorage.setItem(STORAGE_KEY, dark ? DARK_VALUE : "light");
	} catch {
		// localStorage can be blocked (private mode); preference still applies for the session
	}
}

function applyTheme(dark: boolean): void {
	const html = document.documentElement;
	if (dark) {
		html.setAttribute("data-v2-theme", DARK_VALUE);
		html.style.colorScheme = "dark";
	} else {
		html.removeAttribute("data-v2-theme");
		html.style.colorScheme = "light";
	}
}

function clearTheme(): void {
	const html = document.documentElement;
	html.removeAttribute("data-v2-theme");
	html.style.removeProperty("color-scheme");
}

export interface V2ThemeView {
	isDark: boolean;
	mounted: boolean;
	toggle: () => void;
}

export function useV2Theme(): V2ThemeView {
	const [isDark, setIsDark] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setIsDark(readPreference());
		setMounted(true);
	}, []);

	const toggle = useCallback(() => {
		setIsDark((prev) => {
			const next = !prev;
			applyTheme(next);
			persistPreference(next);
			return next;
		});
	}, []);

	return { isDark, mounted, toggle };
}

export function useV2ThemeScope(): void {
	useIsomorphicLayoutEffect(() => {
		applyTheme(readPreference());
		return clearTheme;
	}, []);
}
