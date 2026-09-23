"use client";

import { PaperPlaneTilt, X } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { cn } from "@v2/lib/utils";

interface ReviewCardActionsProps {
	talentName: string;
	isPending: boolean;
	isPinned: boolean;
	onIntro: () => void;
	onPass: () => void;
}

const ACTION_CLASSES =
	"flex size-7 items-center justify-center rounded-full border border-v2-border-default bg-v2-bg-page text-v2-text-secondary shadow-xs transition-colors";

export function ReviewCardActions({ talentName, isPending, isPinned, onIntro, onPass }: ReviewCardActionsProps) {
	return (
		<div
			className={cn(
				"absolute top-2.5 right-3 flex items-center gap-1.5 rounded-full bg-v2-bg-warm pl-3 transition-opacity",
				isPinned
					? "opacity-100"
					: "pointer-events-none opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100",
			)}
		>
			<Button
				type="button"
				variant="unstyled"
				size="unstyled"
				aria-label={`Pass on ${talentName}`}
				disabled={isPending}
				onClick={onPass}
				className={cn(ACTION_CLASSES, "hover:border-v2-status-error hover:text-v2-status-error")}
			>
				<X size={14} weight="bold" />
			</Button>
			<Button
				type="button"
				variant="unstyled"
				size="unstyled"
				aria-label={`Request an intro to ${talentName}`}
				disabled={isPending}
				onClick={onIntro}
				className={cn(ACTION_CLASSES, "hover:border-v2-brand-green hover:text-v2-brand-green")}
			>
				<PaperPlaneTilt size={14} weight="fill" />
			</Button>
		</div>
	);
}

ReviewCardActions.displayName = "ReviewCardActions";
