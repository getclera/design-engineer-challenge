"use client";

import { CaretLeft } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Input } from "@v2/components/ui/input";
import { Kbd } from "@v2/components/ui/kbd";
import { Popover, PopoverAnchor, PopoverContent } from "@v2/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@v2/components/ui/sheet";
import { useRolesList } from "@v2/features/org-roles";
import { INTRO_DECISION_CATEGORIES, PASS_DECISION_CATEGORIES } from "@v2/features/org-shared-modals";
import { useMediaQuery } from "@v2/hooks/use-media-query";
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
 * On phones it's a bottom sheet instead: full width, big rows, no key hints.
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
	const isPhone = useMediaQuery("(max-width: 1023px)");

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

	const close = () => {
		board.dismissPanel();
		board.closeRolePicker();
	};

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

	const onEscapeKeyDown = (e: KeyboardEvent) => {
		if (!canGoBack) return;
		e.preventDefault();
		board.backToRole();
	};
	const content = item && (
		<DecisionOptions
			key={`${isRoleStep ? "role" : "reason"}:${reviewItemKey(item)}`}
			title={title}
			options={options}
			initial={initial}
			withText={!isRoleStep}
			touch={isPhone}
			back={canGoBack && panel?.roleIdOverride ? roles.find((r) => r.id === panel.roleIdOverride)?.position : undefined}
			onBack={board.backToRole}
			onChoose={choose}
			onClose={close}
		/>
	);

	if (isPhone)
		return (
			<>
				{children}
				<Sheet
					open={!!item && !disabled}
					onOpenChange={(open) => {
						if (!open) close();
					}}
				>
					<SheetContent
						side="bottom"
						aria-describedby={undefined}
						onOpenAutoFocus={(e) => e.preventDefault()}
						onEscapeKeyDown={onEscapeKeyDown}
						className={PHONE_SHEET_CLASSES}
					>
						<SheetTitle className="sr-only">{title}</SheetTitle>
						<SheetGrabber />
						{content}
					</SheetContent>
				</Sheet>
			</>
		);

	return (
		<Popover
			open={!!item && !disabled}
			onOpenChange={(open) => {
				if (!open) close();
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
				onEscapeKeyDown={onEscapeKeyDown}
			>
				{content}
			</PopoverContent>
		</Popover>
	);
}

/** Phone bottom sheet: rounded top, scrolls when tall, clears the home indicator. */
export const PHONE_SHEET_CLASSES =
	"max-h-[85dvh] gap-0 overflow-y-auto rounded-t-v2-lg px-3 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]";

/** The little bar on top of a phone sheet, so it reads as something that slid up. */
export function SheetGrabber() {
	return <div aria-hidden className="mx-auto mb-2 h-1 w-10 rounded-full bg-v2-border-default" />;
}

interface DecisionOptionsProps {
	title: string;
	options: Option[];
	initial: number;
	withText: boolean;
	/** Phone: big tap rows, no key hints, no keyboard shortcuts. */
	touch?: boolean;
	back?: string;
	onBack: () => void;
	onChoose: (option: Option | undefined, text?: string) => void;
	onClose: () => void;
}

function DecisionOptions({
	title,
	options,
	initial,
	withText,
	touch = false,
	back,
	onBack,
	onChoose,
	onClose,
}: DecisionOptionsProps) {
	const [hl, setHl] = useState(initial);
	const [text, setText] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	// While open, the popup owns the keyboard wherever focus is (like the old reason panel did).
	useEffect(() => {
		if (touch) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.target === inputRef.current || e.metaKey || e.ctrlKey || e.altKey) return;
			// The physical key, so Shift+1 still picks option 1.
			const digit = Number(/^Digit([1-9])$/.exec(e.code)?.[1]);
			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
				setHl((h) => (h + (e.key === "ArrowDown" ? 1 : options.length - 1)) % options.length);
			} else if (e.key === "Enter") {
				e.preventDefault();
				onChoose(options[hl]);
			} else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
				e.preventDefault();
				onClose();
			} else if (digit >= 1 && digit <= options.length) {
				e.preventDefault();
				onChoose(options[digit - 1]);
			} else if (withText && e.key.length === 1) {
				// Typing starts the "something else" answer; keep the first letter too.
				e.preventDefault();
				setText((t) => t + e.key);
				inputRef.current?.focus();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [touch, options, hl, withText, onChoose, onClose]);

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
				{/* Phone: the sheet's own title already names it for screen readers. */}
				<p
					aria-hidden={touch || undefined}
					className={cn("font-v2-heading font-medium text-v2-text-primary", touch ? "pr-8 text-base" : "text-sm")}
				>
					{title}
				</p>
				{!touch && (
					<span className="flex shrink-0 gap-1">
						<Kbd>↑↓</Kbd>
						<Kbd>↵</Kbd>
					</span>
				)}
			</div>
			{options.map((option, i) => (
				<button
					key={option.id}
					type="button"
					role="option"
					aria-selected={i === hl}
					onMouseEnter={touch ? undefined : () => setHl(i)}
					onClick={() => onChoose(option)}
					className={cn(
						"focus-ring flex w-full items-center gap-2 rounded-v2-sm text-left font-v2-body text-v2-text-body",
						touch ? "min-h-12 px-3 text-base active:bg-v2-bg-active" : "px-2 py-1.5 text-sm",
						!touch && i === hl && "bg-v2-bg-active font-medium text-v2-text-brand",
					)}
				>
					{!touch && i < 9 && <Kbd className="bg-v2-bg-card">{i + 1}</Kbd>}
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
					// 16px text on phones, or iOS zooms the page when the field gets focus.
					className={cn("mt-2 border-v2-border-default bg-v2-bg-page", touch ? "h-11 text-base" : "h-8 text-sm")}
				/>
			)}
		</div>
	);
}
