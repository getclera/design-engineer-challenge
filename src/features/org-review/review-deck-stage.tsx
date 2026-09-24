"use client";

import { ArrowsOutSimple, ArrowsInSimple } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Card } from "@v2/components/ui/card";
import { Kbd } from "@v2/components/ui/kbd";
import { TalentBoardDetailPane, TalentDecisionActionBar } from "@v2/features/org-shared-cards";
import { cn } from "@v2/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { AdminPassButton } from "./admin-pass-button";
import { useReviewBoardContext } from "./review-board-context";
import { ReviewDecisionFooter } from "./review-decision-footer";
import { ReviewFitReason } from "./review-fit-reason";
import { ReviewHeaderMeta } from "./review-header-meta";
import { ReviewProfileShell } from "./review-profile-shell";
import { reviewItemKey, streamOf } from "./types";

interface ReviewDeckStageProps {
	orgId: string;
	selectedRoleId: string | undefined;
	viewerIsPlatformAdmin?: boolean;
}

// The card leaves toward the decision (pass left, intro right); picking someone else just fades.
const cardMotion = {
	initial: { opacity: 0, y: 12, scale: 0.98 },
	animate: { opacity: 1, y: 0, scale: 1 },
	exit: (dir: number) => ({ opacity: 0, x: `${dir * 110}%`, rotate: dir * 6 }),
};
const fadeMotion = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

export function ReviewDeckStage({ orgId, selectedRoleId, viewerIsPlatformAdmin = false }: ReviewDeckStageProps) {
	const board = useReviewBoardContext();
	const item = board.selected;
	const key = item ? reviewItemKey(item) : "none";
	const [expanded, setExpanded] = useState(false);
	const [shownKey, setShownKey] = useState(key);
	if (key !== shownKey) {
		setShownKey(key);
		setExpanded(false);
	}
	const reduceMotion = useReducedMotion();
	const dir = board.lastMove === "pass" ? -1 : board.lastMove === "intro" ? 1 : 0;

	return (
		<div className={cn("relative", expanded && "h-full")}>
			{board.items.length > 1 && (
				<div
					aria-hidden="true"
					className="absolute inset-x-3 top-3 -bottom-2 rounded-v2-lg border border-v2-border-warm bg-v2-bg-card"
				/>
			)}
			<AnimatePresence initial={false} mode="popLayout" custom={dir}>
				<motion.div
					key={key}
					custom={dir}
					variants={reduceMotion ? fadeMotion : cardMotion}
					initial="initial"
					animate="animate"
					exit="exit"
					transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
					className={cn("relative", expanded && "h-full")}
				>
					<Card className={cn("overflow-hidden p-0", expanded && "h-full")}>
						<TalentBoardDetailPane
							orgId={orgId}
							talentId={item?.talentId ?? null}
							compact={!expanded}
							tracking={{
								orgId,
								talentId: item?.talentId ?? "",
								surface: "review",
								roleId: item?.roleId,
								opportunityId: item?.opportunityId,
								source: item?.source,
							}}
							profileMeta={item ? <ReviewHeaderMeta item={item} orgId={orgId} showRole={!selectedRoleId} /> : null}
							profileBelowFacts={
								item ? (
									<>
										<ReviewFitReason reason={item.fitReason} />
										<div className="flex justify-end border-t border-v2-border-warm/50 px-4 py-1.5 sm:px-5">
											<Button
												variant="unstyled"
												size="unstyled"
												aria-expanded={expanded}
												onClick={() => setExpanded((v) => !v)}
												className="flex items-center gap-1.5 font-v2-body font-medium text-v2-text-brand text-xs"
											>
												{expanded ? <ArrowsInSimple size={14} /> : <ArrowsOutSimple size={14} />}
												Full profile
												<Kbd>Space</Kbd>
											</Button>
										</div>
									</>
								) : null
							}
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
					</Card>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

ReviewDeckStage.displayName = "ReviewDeckStage";
