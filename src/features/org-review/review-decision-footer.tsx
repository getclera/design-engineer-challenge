"use client";

import { DecisionPanel, INTRO_DECISION_CATEGORIES, PASS_DECISION_CATEGORIES } from "@v2/features/org-shared-modals";
import { useReviewBoardContext } from "./review-board-context";
import { reviewItemKey } from "./types";

export function ReviewDecisionFooter() {
	const board = useReviewBoardContext();
	const panel = board.panel;
	if (!panel) return null;

	if (panel.mode === "pass") {
		return (
			<DecisionPanel
				key={`pass:${reviewItemKey(panel.item)}`}
				mode="pass"
				talentName={panel.item.talentName}
				categories={PASS_DECISION_CATEGORIES}
				onConfirm={board.confirmPass}
				onTextChange={board.setPanelText}
				onSkip={() => board.confirmPass({})}
				onDismiss={board.dismissPanel}
			/>
		);
	}

	return (
		<DecisionPanel
			key={`intro:${reviewItemKey(panel.item)}`}
			mode="intro"
			talentName={panel.item.talentName}
			categories={INTRO_DECISION_CATEGORIES}
			onConfirm={board.confirmIntro}
			onTextChange={board.setPanelText}
			onPivotToPass={() => board.openPass(panel.item)}
			onDismiss={board.dismissPanel}
		/>
	);
}

ReviewDecisionFooter.displayName = "ReviewDecisionFooter";
