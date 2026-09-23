"use client";

import { Check } from "@phosphor-icons/react";
import {
	TalentBoardDetailPane,
	TalentBoardProfileSkeleton,
	TalentDecisionActionBar,
} from "@v2/features/org-shared-cards";
import type { SimilarPickDecision } from "./hooks/use-similar-pick-action";
import type { SimilarPick } from "./types";

interface SimilarPickDetailProps {
	orgId: string;
	roleId: string;
	anchorFirstName: string;
	pick: SimilarPick;
	decision: SimilarPickDecision | undefined;
	isPending: boolean;
	onRequestIntro: () => void;
	onPass: () => void;
}

export function SimilarPickDetail({
	orgId,
	roleId,
	anchorFirstName,
	pick,
	decision,
	isPending,
	onRequestIntro,
	onPass,
}: SimilarPickDetailProps) {
	return (
		<TalentBoardDetailPane
			orgId={orgId}
			talentId={pick.talentId}
			displayNameOverride={pick.talentName}
			tracking={{ orgId, talentId: pick.talentId, surface: "review_similar", roleId }}
			profileBelowFacts={
				<div className="border-t border-v2-border-warm/50 px-4 py-2 sm:px-5">
					<p className="font-v2-body text-2xs font-medium uppercase tracking-wider text-v2-text-muted">
						Why they're similar to {anchorFirstName}
					</p>
					<p className="mt-1 font-v2-body text-xs font-light leading-snug text-v2-text-secondary">{pick.reason}</p>
				</div>
			}
			fallback={
				<TalentBoardProfileSkeleton name={pick.talentName} oneLiner={pick.headline} avatarUrl={pick.talentAvatarUrl} />
			}
			footer={
				decision ? (
					<p className="flex items-center gap-1.5 border-t border-v2-border-divider px-4 py-3 font-v2-body text-sm text-v2-text-brand-green">
						<Check size={14} weight="bold" aria-hidden="true" />
						{decision === "requested" ? "Intro requested" : "Passed"}
					</p>
				) : (
					<TalentDecisionActionBar
						alreadyInterested={false}
						isPending={isPending}
						onInterview={onRequestIntro}
						onPass={onPass}
						showShortcuts={false}
					/>
				)
			}
		/>
	);
}

SimilarPickDetail.displayName = "SimilarPickDetail";
