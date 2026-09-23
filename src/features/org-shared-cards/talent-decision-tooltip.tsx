"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@v2/components/ui/tooltip";
import type { ReactNode } from "react";

interface TalentDecisionTooltipProps {
	label: string;
	children: ReactNode;
}

const HOVER_DELAY_MS = 1000;

export function TalentDecisionTooltip({ label, children }: TalentDecisionTooltipProps) {
	return (
		<TooltipProvider delayDuration={HOVER_DELAY_MS}>
			<Tooltip delayDuration={HOVER_DELAY_MS}>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent side="top" className="max-w-56">
					{label}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

TalentDecisionTooltip.displayName = "TalentDecisionTooltip";
