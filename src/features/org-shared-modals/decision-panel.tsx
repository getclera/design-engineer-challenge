"use client";

import { PaperPlaneTilt, X } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Input } from "@v2/components/ui/input";
import { useMediaQuery } from "@v2/hooks/use-media-query";
import { cn } from "@v2/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DecisionCategory } from "./decision-categories";

interface DecisionPanelProps {
	mode: "pass" | "intro";
	talentName: string;
	categories: DecisionCategory[];
	onConfirm: (args: { category?: string; categories?: string[]; text?: string }) => void;
	onTextChange?: (text: string) => void;
	onSkip?: () => void;
	onPivotToPass?: () => void;
	onDismiss: () => void;
	requireReason?: boolean;
}

const PANEL_BASE_CLASSES =
	"-mx-px rounded-t-xl rounded-b-v2-lg border border-b-0 border-v2-border-default bg-v2-bg-page px-4 py-3 shadow-v2-content";

const PASS_EDGE_CLASSES = "border-t-2 border-t-v2-status-error";
const INTRO_EDGE_CLASSES = "border-t-2 border-t-v2-brand-green";

const KBD_CLASSES = "rounded bg-v2-bg-warm px-1.5 py-0.5 font-medium text-2xs text-v2-text-tertiary leading-4";

const firstNameOf = (talentName: string) =>
	/^[a-z]/.test(talentName) ? talentName : talentName.split(" ")[0] || talentName;

export function DecisionPanel({
	mode,
	talentName,
	categories,
	onConfirm,
	onTextChange,
	onSkip,
	onPivotToPass,
	onDismiss,
	requireReason = false,
}: DecisionPanelProps) {
	const isPass = mode === "pass";
	const [text, setText] = useState("");
	const [selected, setSelected] = useState<string[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const isDesktop = useMediaQuery("(min-width: 1024px)");

	const toggleCategory = useCallback(
		(id: string) =>
			setSelected((prev) => {
				if (prev.includes(id)) return prev.filter((x) => x !== id);
				return isPass ? [...prev, id] : [id];
			}),
		[isPass],
	);

	const reasonMissing = requireReason && text.trim().length === 0;

	const submit = useCallback(() => {
		const trimmed = text.trim() || undefined;
		if (requireReason && !trimmed) {
			inputRef.current?.focus();
			return;
		}
		if (isPass) {
			onConfirm({ categories: selected.length > 0 ? selected : undefined, text: trimmed });
			return;
		}
		onConfirm({ category: selected[0], text: trimmed });
	}, [isPass, onConfirm, requireReason, selected, text]);

	const dismissAndBlur = useCallback(() => {
		inputRef.current?.blur();
		onDismiss();
	}, [onDismiss]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				dismissAndBlur();
				return;
			}
			const el = e.target;
			const isTyping =
				el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
			if (isTyping || e.metaKey || e.ctrlKey || e.altKey) return;
			if (e.key === "Enter") {
				e.preventDefault();
				submit();
				return;
			}
			if (e.key === "Backspace") {
				e.preventDefault();
				if (onSkip) onSkip();
				else if (onPivotToPass) onPivotToPass();
				else dismissAndBlur();
				return;
			}
			const digit = Number.parseInt(e.key, 10);
			if (digit >= 1 && digit <= categories.length) {
				e.preventDefault();
				const category = categories[digit - 1];
				if (category) toggleCategory(category.id);
				return;
			}
			if (e.key.length !== 1 || /[0-9]/.test(e.key)) return;
			e.preventDefault();
			inputRef.current?.focus();
			const next = text + e.key;
			setText(next);
			onTextChange?.(next);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [categories, dismissAndBlur, onPivotToPass, onSkip, onTextChange, submit, text, toggleCategory]);

	return (
		<div className={cn(PANEL_BASE_CLASSES, isPass ? PASS_EDGE_CLASSES : INTRO_EDGE_CLASSES)} data-decision-panel={mode}>
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="font-v2-heading font-medium text-base text-v2-text-primary">
						{isPass
							? `What was off about ${firstNameOf(talentName)}?`
							: `What caught your eye about ${firstNameOf(talentName)}?`}
					</p>
					<p className="mt-0.5 font-v2-body text-v2-text-tertiary text-xs">
						{requireReason
							? "Name the specific thing: a requirement, a skill, a flag. It shapes the next search."
							: isPass
								? "Your feedback makes the next list better."
								: "Optional. Helps us find more like this."}
					</p>
				</div>
				<div className="flex shrink-0 items-center gap-3">
					{isPass && onSkip && !requireReason && (
						<Button
							type="button"
							variant="unstyled"
							size="unstyled"
							onClick={onSkip}
							className="flex items-center gap-1.5 font-v2-body text-v2-text-secondary text-xs transition-colors hover:text-v2-text-primary"
						>
							Skip
							{isDesktop && <span className={KBD_CLASSES}>⌫</span>}
						</Button>
					)}
					<Button
						type="button"
						variant="unstyled"
						size="unstyled"
						onClick={dismissAndBlur}
						aria-label="Close"
						className="flex items-center gap-1.5 font-v2-body text-v2-text-tertiary text-xs transition-colors hover:text-v2-text-primary"
					>
						{isDesktop && <span className={KBD_CLASSES}>Esc</span>}
						<X className="size-4" />
					</Button>
				</div>
			</div>

			<div className="mt-2.5 flex flex-wrap gap-1.5">
				{categories.map((category, index) => {
					const isOn = selected.includes(category.id);
					return (
						<Button
							key={category.id}
							type="button"
							variant="unstyled"
							size="unstyled"
							aria-pressed={isOn}
							onClick={() => toggleCategory(category.id)}
							className={cn(
								"flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-v2-body font-medium text-xs transition-colors",
								isOn
									? "border-transparent bg-v2-bg-tag-dark text-v2-text-inverse"
									: "border-v2-border-default bg-v2-bg-page text-v2-text-secondary hover:border-v2-text-primary hover:text-v2-text-primary",
							)}
						>
							{isDesktop && (
								<span
									className={cn(
										"rounded px-1 text-2xs leading-4",
										isOn ? "bg-white/20 text-v2-text-inverse" : "bg-v2-bg-warm text-v2-text-tertiary",
									)}
								>
									{index + 1}
								</span>
							)}
							{category.label}
						</Button>
					);
				})}
			</div>

			<div className="mt-2.5 flex items-center gap-2">
				<Input
					ref={inputRef}
					value={text}
					placeholder={
						requireReason ? "Why this one? Be specific" : isDesktop ? "Something else? Just type" : "Something else?"
					}
					aria-required={requireReason}
					maxLength={2000}
					className="h-8 flex-1 border-v2-border-default bg-v2-bg-page text-sm shadow-xs"
					onChange={(e) => {
						setText(e.target.value);
						onTextChange?.(e.target.value);
					}}
					onKeyDown={(e) => {
						if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
						e.preventDefault();
						e.stopPropagation();
						submit();
					}}
				/>
				<Button
					type="button"
					variant={isPass ? "unstyled" : "primary"}
					size={isPass ? "unstyled" : "default"}
					onClick={submit}
					disabled={reasonMissing}
					className={cn(
						"h-8 shrink-0 items-center gap-1.5 text-sm disabled:opacity-50",
						isPass
							? "flex rounded-full bg-v2-status-error px-4 font-v2-body font-medium text-white transition-[filter] hover:brightness-105"
							: "px-3",
					)}
				>
					{!isPass && <PaperPlaneTilt size={14} weight="fill" />}
					{isPass ? "Pass" : "Send request"}
					{selected.length > 0 && (
						<span className="flex size-4 items-center justify-center rounded-full bg-white/25 font-semibold text-2xs tabular-nums">
							{selected.length}
						</span>
					)}
					{isDesktop && <span className="ml-0.5 rounded bg-black/15 px-1 text-2xs leading-4">↵</span>}
				</Button>
			</div>
		</div>
	);
}

DecisionPanel.displayName = "DecisionPanel";
