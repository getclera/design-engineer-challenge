"use client";

import { CaretLeft } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Input } from "@v2/components/ui/input";
import { Kbd } from "@v2/components/ui/kbd";
import { Popover, PopoverAnchor, PopoverContent } from "@v2/components/ui/popover";
import { useRolesList } from "@v2/features/org-roles";
import { INTRO_DECISION_CATEGORIES, PASS_DECISION_CATEGORIES } from "@v2/features/org-shared-modals";
import { cn } from "@v2/lib/utils";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { bestFitRoleId } from "./best-fit-role";
import { useRoleIntroReadiness } from "./hooks/use-role-intro-readiness";
import { useReviewBoardContext } from "./review-board-context";
import { reviewItemKey } from "./types";

interface Option {
	id: string;
	label: string;
	note?: string;
	warn?: boolean;
}

const firstNameOf = (name: string) => name.split(" ")[0] || name;

/**
 * The step after Pass / Request intro, anchored 8px above the decision buttons (`children`):
 * "Which role?" first for people without one, then the reason. ↑↓ or 1–9, Enter, Esc goes back a step.
 */
export function ReviewDecisionPopover({
	orgId,
	disabled = false,
	children,
}: {
	orgId: string;
	/** Another surface (the phone sheet) is showing the same decision. */
	disabled?: boolean;
	children: ReactNode;
}) {
	const board = useReviewBoardContext();
	const { panel, rolePickerItem } = board;
	const item = rolePickerItem ?? panel?.item ?? null;
	const isPass = (rolePickerItem ? board.rolePickerAction : panel?.mode) === "pass";
	const isRoleStep = !!rolePickerItem;
	const canGoBack = !isRoleStep && !!panel && !panel.item.roleId;
	const { data: roles = [] } = useRolesList(orgId, false);
	const { readinessFor } = useRoleIntroReadiness(orgId);

	let options: Option[] = [];
	let initial = 0;
	if (item && isRoleStep) {
		const active = roles.filter((r) => r.status === "active");
		const guess = bestFitRoleId(active, [item.headline, item.talentOneliner, item.fitReason]);
		options = active.map((r) => {
			const readiness = isPass ? { ready: true } : readinessFor(r.id);
			if (!readiness.ready) {
				const note = readiness.reason === "no_hm" ? "No hiring manager" : "No scheduling link";
				return { id: r.id, label: r.position, note, warn: true };
			}
			return { id: r.id, label: r.position, note: r.id === guess ? "Best fit" : undefined };
		});
		initial = Math.max(0, options.findIndex((o) => o.id === guess));
	} else if (item) {
		options = isPass ? PASS_DECISION_CATEGORIES : INTRO_DECISION_CATEGORIES;
	}

	const choose = (option: Option | undefined, text?: string) => {
		if (isRoleStep) {
			if (option) board.confirmRolePicker(option.id);
		} else if (isPass) board.confirmPass(text ? { text } : { category: option?.id });
		else board.confirmIntro(text ? { text } : { category: option?.id });
	};

	const title = !item
		? ""
		: isRoleStep
			? isPass
				? "Which role are you passing for?"
				: "Which role is this intro for?"
			: isPass
				? `What was off about ${firstNameOf(item.talentName)}?`
				: `What caught your eye about ${firstNameOf(item.talentName)}?`;

	return (
		<Popover
			open={!!item && !disabled}
			onOpenChange={(open) => {
				if (open) return;
				board.dismissPanel();
				board.closeRolePicker();
			}}
		>
			<PopoverAnchor asChild>{children}</PopoverAnchor>
			<PopoverContent
				side="top"
				align={isPass ? "start" : "end"}
				// The anchor is the whole action bar (border-t + py-3), so land 8px from the button itself.
				sideOffset={8 - 13}
				alignOffset={16}
				className="w-96 p-2"
				onOpenAutoFocus={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => {
					if (!canGoBack) return;
					e.preventDefault();
					board.backToRole();
				}}
			>
				{item && (
					<DecisionOptions
						key={`${isRoleStep ? "role" : "reason"}:${reviewItemKey(item)}`}
						title={title}
						options={options}
						initial={initial}
						withText={!isRoleStep}
						back={canGoBack && panel?.roleIdOverride ? roles.find((r) => r.id === panel.roleIdOverride)?.position : undefined}
						onBack={board.backToRole}
						onChoose={choose}
					/>
				)}
			</PopoverContent>
		</Popover>
	);
}

interface DecisionOptionsProps {
	title: string;
	options: Option[];
	initial: number;
	withText: boolean;
	back?: string;
	onBack: () => void;
	onChoose: (option: Option | undefined, text?: string) => void;
}

function DecisionOptions({ title, options, initial, withText, back, onBack, onChoose }: DecisionOptionsProps) {
	const [hl, setHl] = useState(initial);
	const [text, setText] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	// While open, the popup owns the keyboard wherever focus is (like the old reason panel did).
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.target === inputRef.current || e.metaKey || e.ctrlKey || e.altKey) return;
			const digit = Number.parseInt(e.key, 10);
			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
				setHl((h) => (h + (e.key === "ArrowDown" ? 1 : options.length - 1)) % options.length);
			} else if (e.key === "Enter") {
				e.preventDefault();
				onChoose(options[hl]);
			} else if (digit >= 1 && digit <= options.length) {
				e.preventDefault();
				onChoose(options[digit - 1]);
			} else if (withText && e.key.length === 1) {
				inputRef.current?.focus(); // typing starts the "something else" answer
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [options, hl, withText, onChoose]);

	return (
		<div role="listbox" aria-label={title}>
			{back && (
				<Button
					variant="unstyled"
					size="unstyled"
					onClick={onBack}
					className="focus-ring mb-1 flex items-center gap-1 rounded-v2-sm px-2 font-v2-body text-v2-text-tertiary text-xs hover:text-v2-text-primary"
				>
					<CaretLeft size={12} />
					{back}
				</Button>
			)}
			<div className="flex items-center justify-between gap-2 px-2 pt-1 pb-2">
				<p className="font-v2-heading font-medium text-sm text-v2-text-primary">{title}</p>
				<span className="flex shrink-0 gap-1">
					<Kbd>↑↓</Kbd>
					<Kbd>↵</Kbd>
				</span>
			</div>
			{options.map((option, i) => (
				<button
					key={option.id}
					type="button"
					role="option"
					aria-selected={i === hl}
					onMouseEnter={() => setHl(i)}
					onClick={() => onChoose(option)}
					className={cn(
						"focus-ring flex w-full items-center gap-2 rounded-v2-sm px-2 py-1.5 text-left font-v2-body text-sm text-v2-text-body",
						i === hl && "bg-v2-bg-active font-medium text-v2-text-brand",
					)}
				>
					{i < 9 && <Kbd className="bg-v2-bg-card">{i + 1}</Kbd>}
					<span className="min-w-0 flex-1 truncate">{option.label}</span>
					{option.note && (
						<span className={cn("shrink-0 text-2xs", option.warn ? "text-v2-status-warning" : "text-v2-text-tertiary")}>
							{option.note}
						</span>
					)}
				</button>
			))}
			{withText && (
				<Input
					ref={inputRef}
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={(e) => {
						if (e.key !== "Enter" || e.nativeEvent.isComposing || !text.trim()) return;
						e.preventDefault();
						onChoose(undefined, text.trim());
					}}
					placeholder="Something else? Just type"
					maxLength={2000}
					className="mt-2 h-8 border-v2-border-default bg-v2-bg-page text-sm"
				/>
			)}
		</div>
	);
}
