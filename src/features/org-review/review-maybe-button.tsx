"use client";

import { Question } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Input } from "@v2/components/ui/input";
import { Kbd } from "@v2/components/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@v2/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@v2/components/ui/sheet";
import { TalentDecisionTooltip } from "@v2/features/org-shared-cards";
import { useMediaQuery } from "@v2/hooks/use-media-query";
import { cn } from "@v2/lib/utils";
import { useState } from "react";
import { useReviewBoardContext } from "./review-board-context";
import { PHONE_SHEET_CLASSES, SheetGrabber } from "./review-decision-popover";
import { type ReviewItem, reviewItemKey } from "./types";

/** "Maybe" for the decision bar: parks the person with an optional note, in a popup centred on the button (a bottom sheet on phones). */
export function ReviewMaybeButton({
	item,
	isPending,
	disabled = false,
}: {
	item: ReviewItem;
	isPending: boolean;
	/** Another copy (the phone sheet) owns the popup right now. */
	disabled?: boolean;
}) {
	const board = useReviewBoardContext();
	const showHint = useMediaQuery("(min-width: 1024px)");
	const open = !disabled && !!board.maybeItem && reviewItemKey(board.maybeItem) === reviewItemKey(item);

	const onOpenChange = (next: boolean) => (next ? board.openMaybe(item) : board.closeMaybe());
	const note = <MaybeNoteForm initialNote={item.maybe?.note ?? ""} onSave={board.confirmMaybe} touch={!showHint} />;

	if (!showHint)
		return (
			<>
				<Button
					variant="ghost"
					className="shrink-0"
					disabled={isPending}
					aria-label="Maybe"
					onClick={() => board.openMaybe(item)}
				>
					Maybe
				</Button>
				<Sheet open={open} onOpenChange={onOpenChange}>
					<SheetContent
						side="bottom"
						aria-describedby={undefined}
						// No keyboard popping up on open: saving without a note is one tap.
						onOpenAutoFocus={(e) => e.preventDefault()}
						className={PHONE_SHEET_CLASSES}
					>
						<SheetTitle className="sr-only">Maybe. Why unsure?</SheetTitle>
						<SheetGrabber />
						{note}
					</SheetContent>
				</Sheet>
			</>
		);

	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<TalentDecisionTooltip label="Not sure yet. Moves to Maybe, decide anytime.">
				<PopoverTrigger asChild>
					<Button variant="ghost" className="shrink-0 gap-1.5" disabled={isPending} aria-label="Maybe">
						{/* Phone: the word only, so Pass and Request intro keep their room. */}
						<Question size={16} weight="bold" className="hidden sm:block" />
						Maybe
						{showHint && <Kbd className="ml-1 bg-black/15 px-1 py-0 text-current">M</Kbd>}
					</Button>
				</PopoverTrigger>
			</TalentDecisionTooltip>
			<PopoverContent side="top" sideOffset={8} className="w-80 p-3">
				{note}
			</PopoverContent>
		</Popover>
	);
}

function MaybeNoteForm({
	initialNote,
	onSave,
	touch,
}: {
	initialNote: string;
	onSave: (note: string) => void;
	/** Phone: bigger field and button, no key hints. */
	touch: boolean;
}) {
	const [note, setNote] = useState(initialNote);
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSave(note.trim());
			}}
		>
			<div className="flex items-center justify-between gap-2 pb-2">
				<p
					aria-hidden={touch || undefined}
					className={cn("font-v2-heading font-medium text-v2-text-primary", touch ? "pr-8 text-base" : "text-sm")}
				>
					Maybe. Why unsure?
				</p>
				{!touch && (
					<span className="flex shrink-0 gap-1">
						<Kbd>↵</Kbd>
						<Kbd>Esc</Kbd>
					</span>
				)}
			</div>
			<div className="flex gap-2">
				<Input
					aria-label="Note for Maybe (optional)"
					value={note}
					onChange={(e) => setNote(e.target.value)}
					placeholder="Optional, e.g. check salary"
					maxLength={80}
					// Phone: keep the field in view above the keyboard; 16px text so iOS doesn't zoom.
					onFocus={touch ? (e) => e.currentTarget.scrollIntoView({ block: "center" }) : undefined}
					className={cn("flex-1 border-v2-border-default bg-v2-bg-page", touch ? "h-11 text-base" : "h-8 text-sm")}
				/>
				<Button type="submit" size="sm" className={touch ? "h-11 px-5" : "h-8"}>
					Save
				</Button>
			</div>
			<p className="pt-2 font-v2-body text-v2-text-tertiary text-xs">Leave empty to park without a note</p>
		</form>
	);
}
