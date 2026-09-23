"use client";

import { CaretRight, Check, PaperPlaneTilt, X } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { TalentBoardCard } from "@v2/features/org-shared-cards";
import type { SimilarPickDecision } from "./hooks/use-similar-pick-action";
import type { SimilarPick } from "./types";

interface SimilarPickCardProps {
	pick: SimilarPick;
	decision: SimilarPickDecision | undefined;
	isPending: boolean;
	onOpen: () => void;
	onRequestIntro: () => void;
	onPass: () => void;
}

const noop = () => undefined;

export function SimilarPickCard({ pick, decision, isPending, onOpen, onRequestIntro, onPass }: SimilarPickCardProps) {
	return (
		<div className="border-v2-border-divider border-b last:border-b-0">
			<TalentBoardCard
				item={{
					name: pick.talentName,
					avatarUrl: pick.talentAvatarUrl,
					subtitle: pick.headline,
					companies: pick.companies,
					school: pick.school,
				}}
				isSelected={false}
				onSelect={onOpen}
				onPrefetch={noop}
				badge={
					<CaretRight size={14} weight="bold" aria-hidden="true" className="ml-auto shrink-0 text-v2-text-muted" />
				}
			/>
			<div className="flex flex-col gap-3 px-4 pb-4 pl-16">
				<p className="font-v2-heading text-sm text-v2-text-body leading-snug">{pick.reason}</p>
				<div className="flex items-center gap-2">
					{decision ? (
						<p className="flex items-center gap-1.5 font-v2-body text-sm text-v2-text-brand-green">
							<Check size={14} weight="bold" aria-hidden="true" />
							{decision === "requested" ? "Intro requested" : "Passed"}
						</p>
					) : (
						<>
							<Button variant="primary" size="sm" className="gap-1.5" disabled={isPending} onClick={onRequestIntro}>
								<PaperPlaneTilt size={14} weight="fill" aria-hidden="true" />
								Request intro
							</Button>
							<Button variant="ghost" size="sm" className="gap-1.5" disabled={isPending} onClick={onPass}>
								<X size={14} weight="bold" aria-hidden="true" />
								Pass
							</Button>
						</>
					)}
					<Button variant="ghost" size="sm" className="ml-auto gap-1 text-v2-text-secondary" onClick={onOpen}>
						View profile
						<CaretRight size={12} weight="bold" aria-hidden="true" />
					</Button>
				</div>
			</div>
		</div>
	);
}

SimilarPickCard.displayName = "SimilarPickCard";
