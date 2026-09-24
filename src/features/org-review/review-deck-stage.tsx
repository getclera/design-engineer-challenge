"use client";

import { ArrowsOutSimple, ArrowsInSimple } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Card } from "@v2/components/ui/card";
import { Kbd } from "@v2/components/ui/kbd";
import { TalentBoardDetailPane, TalentDecisionActionBar } from "@v2/features/org-shared-cards";
import { cn } from "@v2/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AdminPassButton } from "./admin-pass-button";
import { REVIEW_DECK_GHOST_CLASSES } from "./constants";
import { useReviewBoardContext } from "./review-board-context";
import { ReviewDecisionPopover } from "./review-decision-popover";
import { ReviewFitReason } from "./review-fit-reason";
import { ReviewHeaderMeta } from "./review-header-meta";
import { ReviewMaybeButton } from "./review-maybe-button";
import { ReviewProfileShell } from "./review-profile-shell";
import { ReviewViewOnlyNote } from "./review-view-only-note";
import { reviewItemKey, streamOf } from "./types";

interface ReviewDeckStageProps {
	orgId: string;
	selectedRoleId: string | undefined;
	viewerIsPlatformAdmin?: boolean;
	canDecide: boolean;
	/** Full profile open (Space); owned by the board so the keyboard can toggle it. */
	expanded: boolean;
	onExpandedChange: (expanded: boolean) => void;
	/** Phone: drag the card right to request an intro, left to pass. */
	swipe?: boolean;
	/** The phone sheet is open and owns the decision popup. */
	decisionsInSheet?: boolean;
}

// The card leaves toward the decision (pass left, intro right, maybe down); picking someone else just fades.
const EXIT = { pass: -1, intro: 1 } as const;
const cardMotion = {
	initial: { opacity: 0, y: 12, scale: 0.98 },
	animate: { opacity: 1, y: 0, scale: 1 },
	exit: (move: "pass" | "intro" | "maybe" | null) =>
		move === "maybe"
			? { opacity: 0, y: "30%" }
			: { opacity: 0, x: `${(move ? EXIT[move] : 0) * 110}%`, rotate: (move ? EXIT[move] : 0) * 6 },
};
const SWIPE_DISTANCE = 100;
const fadeMotion = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

export function ReviewDeckStage({
	orgId,
	selectedRoleId,
	viewerIsPlatformAdmin = false,
	canDecide,
	expanded,
	onExpandedChange,
	swipe = false,
	decisionsInSheet = false,
}: ReviewDeckStageProps) {
	const board = useReviewBoardContext();
	const item = board.selected;
	const key = item ? reviewItemKey(item) : "none";
	const reduceMotion = useReducedMotion();
	const similar = item ? board.similarTo.get(key) : undefined;

	return (
		<div className={cn("relative", expanded && "h-full")}>
			{board.items.length > 1 && (
				<div aria-hidden="true" className={REVIEW_DECK_GHOST_CLASSES} />
			)}
			<AnimatePresence initial={false} mode="popLayout" custom={board.lastMove}>
				<motion.div
					key={key}
					custom={board.lastMove}
					variants={reduceMotion ? fadeMotion : cardMotion}
					initial="initial"
					animate="animate"
					exit="exit"
					transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
					drag={swipe && canDecide && item ? "x" : false}
					dragSnapToOrigin
					onDragEnd={(_, { offset }) => {
						if (!item || Math.abs(offset.x) < SWIPE_DISTANCE) return;
						if (offset.x > 0) board.openIntro(item);
						else board.openPass(item);
					}}
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
										{similar && (
											<div className="border-t border-v2-border-warm/50 px-4 py-2 sm:px-5">
												<p className="font-v2-body text-2xs font-medium uppercase tracking-wider text-v2-text-muted">
													Similar profiles to {similar.anchor.talentName.split(" ")[0]}
												</p>
												<p className="mt-1 font-v2-body text-xs font-light leading-snug text-v2-text-secondary">
													{similar.reason}
												</p>
											</div>
										)}
										<ReviewFitReason reason={item.fitReason} />
										<div className="flex justify-end border-t border-v2-border-warm/50 px-4 py-1.5 sm:px-5">
											<Button
												variant="unstyled"
												size="unstyled"
												aria-expanded={expanded}
												onClick={() => onExpandedChange(!expanded)}
												className="focus-ring flex items-center gap-1.5 rounded-v2-sm font-v2-body font-medium text-v2-text-brand text-xs"
											>
												{expanded ? <ArrowsInSimple size={14} /> : <ArrowsOutSimple size={14} />}
												Full profile
												<Kbd className="hidden lg:inline-flex">Space</Kbd>
											</Button>
										</div>
									</>
								) : null
							}
							fallback={item ? <ReviewProfileShell item={item} /> : null}
							footer={
								item &&
								(!canDecide ? (
									<ReviewViewOnlyNote />
								) : (
									<ReviewDecisionPopover orgId={orgId} disabled={decisionsInSheet}>
										<div>
											<TalentDecisionActionBar
												alreadyInterested={streamOf(item.bucket) === "interest"}
												isPending={board.isPending(item)}
												onInterview={() => board.openIntro(item)}
												onPass={() => board.openPass(item)}
												middleAction={
														<ReviewMaybeButton
															item={item}
															isPending={board.isPending(item)}
															disabled={decisionsInSheet}
														/>
													}
												leadingAction={
													viewerIsPlatformAdmin ? (
														<AdminPassButton orgId={orgId} item={item} roleId={selectedRoleId} iconOnly />
													) : undefined
												}
											/>
										</div>
									</ReviewDecisionPopover>
								))
							}
						/>
					</Card>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

ReviewDeckStage.displayName = "ReviewDeckStage";
