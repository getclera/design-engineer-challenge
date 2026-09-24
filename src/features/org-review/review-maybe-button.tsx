"use client";

import { Question } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Input } from "@v2/components/ui/input";
import { Kbd } from "@v2/components/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@v2/components/ui/popover";
import { TalentDecisionTooltip } from "@v2/features/org-shared-cards";
import { useMediaQuery } from "@v2/hooks/use-media-query";
import { useState } from "react";
import { useReviewBoardContext } from "./review-board-context";
import { type ReviewItem, reviewItemKey } from "./types";

/** "Maybe" for the decision bar: parks the person with an optional note, in a popup centred on the button. */
export function ReviewMaybeButton({ item, isPending }: { item: ReviewItem; isPending: boolean }) {
	const board = useReviewBoardContext();
	const showHint = useMediaQuery("(min-width: 1024px)");
	const open = !!board.maybeItem && reviewItemKey(board.maybeItem) === reviewItemKey(item);

	return (
		<Popover open={open} onOpenChange={(next) => (next ? board.openMaybe(item) : board.closeMaybe())}>
			<TalentDecisionTooltip label="Not sure yet. Moves to Maybe, decide anytime.">
				<PopoverTrigger asChild>
					<Button variant="ghost" className="shrink-0 gap-1.5" disabled={isPending} aria-label="Maybe">
						<Question size={16} weight="bold" />
						{/* Phone: icon only, so Pass and Request intro keep their room. */}
						<span className="hidden sm:inline">Maybe</span>
						{showHint && <Kbd className="ml-1 bg-black/15 px-1 py-0 text-current">M</Kbd>}
					</Button>
				</PopoverTrigger>
			</TalentDecisionTooltip>
			<PopoverContent side="top" sideOffset={8} className="w-80 p-3">
				<MaybeNoteForm initialNote={item.maybe?.note ?? ""} onSave={board.confirmMaybe} />
			</PopoverContent>
		</Popover>
	);
}

function MaybeNoteForm({ initialNote, onSave }: { initialNote: string; onSave: (note: string) => void }) {
	const [note, setNote] = useState(initialNote);
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSave(note.trim());
			}}
		>
			<div className="flex items-center justify-between gap-2 pb-2">
				<p className="font-v2-heading font-medium text-sm text-v2-text-primary">Maybe. Why unsure?</p>
				<span className="flex shrink-0 gap-1">
					<Kbd>↵</Kbd>
					<Kbd>Esc</Kbd>
				</span>
			</div>
			<div className="flex gap-2">
				<Input
					aria-label="Note for Maybe (optional)"
					value={note}
					onChange={(e) => setNote(e.target.value)}
					placeholder="Optional, e.g. check salary"
					maxLength={80}
					className="h-8 flex-1 border-v2-border-default bg-v2-bg-page text-sm"
				/>
				<Button type="submit" size="sm" className="h-8">
					Save
				</Button>
			</div>
			<p className="pt-2 font-v2-body text-v2-text-tertiary text-xs">Leave empty to park without a note</p>
		</form>
	);
}
