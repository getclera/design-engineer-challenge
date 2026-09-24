"use client";

import { TalentDecisionActionBar } from "@v2/features/org-shared-cards";
import { OrgTalentProfileSheet } from "@v2/features/org-talent-profile";
import { ReviewDecisionPopover } from "./review-decision-popover";
import { type ReviewItem, streamOf } from "./types";

interface ReviewMobileSheetProps {
	orgId: string;
	talent: ReviewItem | null;
	open: boolean;
	isPending: boolean;
	onClose: () => void;
	onInterview: (item: ReviewItem) => void;
	onPass: (item: ReviewItem) => void;
}

export function ReviewMobileSheet({
	orgId,
	talent,
	open,
	isPending,
	onClose,
	onInterview,
	onPass,
}: ReviewMobileSheetProps) {
	return (
		<OrgTalentProfileSheet
			open={open}
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
			orgId={orgId}
			talentId={talent?.talentId ?? null}
			talentName={talent?.talentName ?? null}
			surface="review"
			trackingSource={talent?.source ?? null}
			footer={
				talent && (
					<ReviewDecisionPopover orgId={orgId}>
						<div>
							<TalentDecisionActionBar
								alreadyInterested={streamOf(talent.bucket) === "interest"}
								isPending={isPending}
								onInterview={() => onInterview(talent)}
								onPass={() => onPass(talent)}
							/>
						</div>
					</ReviewDecisionPopover>
				)
			}
		/>
	);
}

ReviewMobileSheet.displayName = "ReviewMobileSheet";
