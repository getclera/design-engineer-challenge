"use client";

import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { type MouseEvent, useCallback } from "react";
import { isRepeatClick } from "@/utils/mouse";

interface ShowMoreFooterProps {
	expanded: boolean;
	onToggle: () => void;
	moreCount: number;
}

function ShowMoreFooter({ expanded, onToggle, moreCount }: ShowMoreFooterProps) {
	const handleClick = useCallback(
		(event: MouseEvent<HTMLButtonElement>) => {
			if (isRepeatClick(event)) return;
			onToggle();
		},
		[onToggle],
	);

	return (
		<Button
			variant="ghost"
			onClick={handleClick}
			className="h-auto w-full !rounded-none border-x-0 border-b-0 border-t border-v2-border-warm/50 py-1.5 font-v2-body text-xs text-v2-text-muted hover:bg-v2-bg-warm hover:text-v2-text-secondary"
		>
			{expanded ? "Show less" : `Show ${moreCount} more`}
			{expanded ? <CaretUp size={10} /> : <CaretDown size={10} />}
		</Button>
	);
}
ShowMoreFooter.displayName = "ShowMoreFooter";

export { ShowMoreFooter };
