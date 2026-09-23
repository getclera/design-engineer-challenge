"use client";

import { PaperPlaneTilt, X } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { useMediaQuery } from "@v2/hooks/use-media-query";
import type { ReactNode } from "react";
import { TalentDecisionTooltip } from "./talent-decision-tooltip";

interface TalentDecisionActionBarProps {
	alreadyInterested: boolean;
	isPending?: boolean;
	onInterview: () => void;
	onPass: () => void;
	showShortcuts?: boolean;
	leadingAction?: ReactNode;
}

const KBD = "ml-1 rounded bg-black/15 px-1 text-2xs leading-4";

export function TalentDecisionActionBar({
	alreadyInterested,
	isPending = false,
	onInterview,
	onPass,
	showShortcuts = true,
	leadingAction,
}: TalentDecisionActionBarProps) {
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const showHints = showShortcuts && isDesktop;
	return (
		<div className="flex items-center gap-2 border-t border-v2-border-divider px-4 py-3">
			{leadingAction}
			<TalentDecisionTooltip label="Not a fit for this role. Moves to Passed, undo anytime.">
				<Button variant="ghost" className="flex-2 gap-1.5" disabled={isPending} onClick={onPass}>
					<X size={16} weight="bold" />
					Pass
					{showHints && <span className={KBD}>⌫</span>}
				</Button>
			</TalentDecisionTooltip>
			<TalentDecisionTooltip
				label={
					alreadyInterested
						? "They already asked to meet you. We set the intro up right away."
						: "You want to meet them. We reach out and set up the intro."
				}
			>
				<Button variant="primary" className="flex-3 gap-1.5" disabled={isPending} onClick={onInterview}>
					<PaperPlaneTilt size={16} weight="fill" />
					{alreadyInterested ? "Make an intro" : "Request intro"}
					{showHints && <span className={KBD}>↵</span>}
				</Button>
			</TalentDecisionTooltip>
		</div>
	);
}

TalentDecisionActionBar.displayName = "TalentDecisionActionBar";
