"use client";

import { useEffect } from "react";

interface UseTalentDecisionKeyboardParams<TItem> {
	selected: TItem | null;
	enabled: boolean;
	panelOpen: boolean;
	onIntro: (item: TItem) => void;
	onOpenPass: (item: TItem) => void;
	onMaybe?: (item: TItem) => void;
	/** Screen-level keys (e.g. Space, L, ?); return true when handled. Runs even with nobody selected. */
	onKey?: (key: string) => boolean;
	onSelectPrev: () => void;
	onSelectNext: () => void;
}

export function useTalentDecisionKeyboard<TItem>({
	selected,
	enabled,
	panelOpen,
	onIntro,
	onOpenPass,
	onMaybe,
	onKey,
	onSelectPrev,
	onSelectNext,
}: UseTalentDecisionKeyboardParams<TItem>) {
	useEffect(() => {
		if (!enabled || panelOpen) return;
		const handleKey = (e: KeyboardEvent) => {
			const el = e.target;
			if (el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) {
				return;
			}
			if (e.metaKey || e.ctrlKey || e.altKey) return;
			// Space on a focused button presses that button; don't also toggle the screen.
			if (e.key === " " && el instanceof Element && el.closest("button,a,[role=button],summary")) return;
			if (onKey?.(e.key)) {
				e.preventDefault();
				return;
			}
			if (!selected || e.repeat) return; // a held key never decides more than one person
			if (e.key === "ArrowUp") {
				e.preventDefault();
				onSelectPrev();
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				onSelectNext();
			} else if (e.key === "Enter" || e.key === "ArrowRight") {
				e.preventDefault();
				onIntro(selected);
			} else if (e.key === "Backspace" || e.key === "ArrowLeft") {
				e.preventDefault();
				onOpenPass(selected);
			} else if (onMaybe && (e.key === "m" || e.key === "M")) {
				e.preventDefault();
				onMaybe(selected);
			}
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [selected, enabled, panelOpen, onIntro, onOpenPass, onMaybe, onKey, onSelectPrev, onSelectNext]);
}
