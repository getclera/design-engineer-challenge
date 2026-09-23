"use client";

import { useEffect } from "react";

interface UseTalentDecisionKeyboardParams<TItem> {
	selected: TItem | null;
	enabled: boolean;
	panelOpen: boolean;
	onIntro: (item: TItem) => void;
	onOpenPass: (item: TItem) => void;
	onSelectPrev: () => void;
	onSelectNext: () => void;
}

export function useTalentDecisionKeyboard<TItem>({
	selected,
	enabled,
	panelOpen,
	onIntro,
	onOpenPass,
	onSelectPrev,
	onSelectNext,
}: UseTalentDecisionKeyboardParams<TItem>) {
	useEffect(() => {
		if (!enabled || panelOpen) return;
		const onKey = (e: KeyboardEvent) => {
			const el = e.target;
			if (el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) {
				return;
			}
			if (!selected) return;
			if (e.key === "ArrowUp") {
				e.preventDefault();
				onSelectPrev();
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				onSelectNext();
			} else if (e.key === "Enter") {
				e.preventDefault();
				onIntro(selected);
			} else if (e.key === "Backspace") {
				e.preventDefault();
				onOpenPass(selected);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [selected, enabled, panelOpen, onIntro, onOpenPass, onSelectPrev, onSelectNext]);
}
