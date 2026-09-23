"use client";

import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Dialog, DialogContent } from "@v2/components/ui/dialog";
import { DialogHeaderBar } from "@v2/components/ui/dialog-header-bar";
import { useRef, useState } from "react";
import type { SimilarFollowThrough } from "./hooks/use-similar-follow-through";
import { useSimilarPickAction } from "./hooks/use-similar-pick-action";
import { SimilarPickCard } from "./similar-pick-card";
import { SimilarPickDetail } from "./similar-pick-detail";

const KBD = "ml-1 rounded bg-v2-bg-input-solid px-1 text-2xs leading-4 text-v2-text-tertiary";

interface SimilarPicksModalProps {
	orgId: string;
	followThrough: SimilarFollowThrough;
	onContinue: () => void;
}

export function SimilarPicksModal({ orgId, followThrough, onContinue }: SimilarPicksModalProps) {
	const { decisions, act, pendingTalentId } = useSimilarPickAction(orgId, followThrough, onContinue);
	const [openTalentId, setOpenTalentId] = useState<string | null>(null);
	const continueRef = useRef<HTMLButtonElement>(null);
	const { anchor, roleId, picks } = followThrough;
	const firstName = anchor.talentName.split(" ")[0] || anchor.talentName;
	const openPick = picks.find((pick) => pick.talentId === openTalentId);

	return (
		<Dialog
			open
			onOpenChange={(open) => {
				if (!open) onContinue();
			}}
		>
			<DialogContent
				className={
					openPick
						? "gap-0 overflow-hidden p-0 md:h-[85vh] md:max-w-200 [&>button]:hidden"
						: "gap-0 overflow-hidden p-0 md:max-w-160 [&>button]:hidden"
				}
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					continueRef.current?.focus();
				}}
			>
				<DialogHeaderBar
					title={
						openPick ? (
							<Button
								variant="ghost"
								size="sm"
								className="-ml-2 gap-1.5 text-v2-text-secondary"
								onClick={() => setOpenTalentId(null)}
							>
								<ArrowLeft size={14} weight="bold" aria-hidden="true" />
								Similar profiles to {firstName}
							</Button>
						) : (
							<>
								<span className="grid size-5 shrink-0 place-items-center rounded-full bg-v2-status-success text-v2-text-inverse">
									<Check size={12} weight="bold" aria-hidden="true" />
								</span>
								Intro requested with {firstName}
							</>
						)
					}
					onClose={onContinue}
				/>

				{openPick ? (
					<div className="flex min-h-0 flex-1 flex-col *:min-h-0 *:flex-1">
						<SimilarPickDetail
							orgId={orgId}
							roleId={roleId}
							anchorFirstName={firstName}
							pick={openPick}
							decision={decisions[openPick.talentId]}
							isPending={pendingTalentId !== null}
							onRequestIntro={() => act({ talentId: openPick.talentId, action: "request_intro" })}
							onPass={() => act({ talentId: openPick.talentId, action: "pass" })}
						/>
					</div>
				) : (
					<>
						<div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
							<p className="font-v2-body text-sm text-v2-text-secondary">
								We message them today. Meanwhile, two similar profiles for this role.
							</p>
							<h3 className="mt-4 font-semibold font-v2-heading text-lg text-v2-text-primary">
								Similar profiles to {firstName}
							</h3>
							<div className="mt-3 overflow-hidden rounded-v2-md border border-v2-border-warm bg-v2-bg-card">
								{picks.map((pick) => (
									<SimilarPickCard
										key={pick.talentId}
										pick={pick}
										decision={decisions[pick.talentId]}
										isPending={pendingTalentId !== null}
										onOpen={() => setOpenTalentId(pick.talentId)}
										onRequestIntro={() => act({ talentId: pick.talentId, action: "request_intro" })}
										onPass={() => act({ talentId: pick.talentId, action: "pass" })}
									/>
								))}
							</div>
						</div>
						<div className="flex shrink-0 justify-end border-v2-border-divider border-t px-4 py-3">
							<Button ref={continueRef} variant="ghost" className="gap-1.5" onClick={onContinue}>
								Continue reviewing
								<ArrowRight size={16} weight="bold" aria-hidden="true" />
								<span className={KBD}>↵</span>
							</Button>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

SimilarPicksModal.displayName = "SimilarPicksModal";
