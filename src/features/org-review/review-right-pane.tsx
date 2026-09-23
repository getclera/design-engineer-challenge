"use client";

import { TalentBoardDetailPane, TalentDecisionActionBar } from "@v2/features/org-shared-cards";
import { AdminPassButton } from "./admin-pass-button";
import { useReviewBoardContext } from "./review-board-context";
import { ReviewDecisionFooter } from "./review-decision-footer";
import { ReviewFitReason } from "./review-fit-reason";
import { ReviewHeaderMeta } from "./review-header-meta";
import { ReviewProfileShell } from "./review-profile-shell";
import { streamOf } from "./types";

interface ReviewRightPaneProps {
	orgId: string;
	selectedRoleId: string | undefined;
	viewerIsPlatformAdmin?: boolean;
}

export function ReviewRightPane({ orgId, selectedRoleId, viewerIsPlatformAdmin = false }: ReviewRightPaneProps) {
	const board = useReviewBoardContext();
	const item = board.selected;

	return (
		<TalentBoardDetailPane
			orgId={orgId}
			talentId={item?.talentId ?? null}
			tracking={{
				orgId,
				talentId: item?.talentId ?? "",
				surface: "review",
				roleId: item?.roleId,
				opportunityId: item?.opportunityId,
				source: item?.source,
			}}
			profileMeta={item ? <ReviewHeaderMeta item={item} orgId={orgId} showRole={!selectedRoleId} /> : null}
			profileBelowFacts={item ? <ReviewFitReason reason={item.fitReason} /> : null}
			fallback={item ? <ReviewProfileShell item={item} /> : null}
			footer={
				<>
					<ReviewDecisionFooter />
					{item && !board.panel && (
						<TalentDecisionActionBar
							alreadyInterested={streamOf(item.bucket) === "interest"}
							isPending={board.isPending(item)}
							onInterview={() => board.openIntro(item)}
							onPass={() => board.openPass(item)}
							leadingAction={
								viewerIsPlatformAdmin ? (
									<AdminPassButton orgId={orgId} item={item} roleId={selectedRoleId} iconOnly />
								) : undefined
							}
						/>
					)}
				</>
			}
		/>
	);
}

ReviewRightPane.displayName = "ReviewRightPane";
