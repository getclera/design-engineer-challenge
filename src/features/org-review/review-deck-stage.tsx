"use client";

import { ArrowsOutSimple, ArrowsInSimple, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { ErrorBanner } from "@v2/components/ui/error-banner";
import { Card } from "@v2/components/ui/card";
import { Kbd } from "@v2/components/ui/kbd";
import { UserAvatar } from "@v2/components/ui/avatar";
import { TalentBoardDetailPane, TalentDecisionActionBar } from "@v2/features/org-shared-cards";
import { cn } from "@v2/lib/utils";
import { TalentEntityChips } from "@v2/components/data-display";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect } from "react";
import { AdminPassButton } from "./admin-pass-button";
import { REVIEW_DECK_GHOST_CLASSES } from "./constants";
import { useReviewBoardContext } from "./review-board-context";
import { ReviewDecisionPopover } from "./review-decision-popover";
import { ReviewFitReason } from "./review-fit-reason";
import { ReviewHeaderMeta } from "./review-header-meta";
import { ReviewMaybeButton } from "./review-maybe-button";
import { ReviewNextUp } from "./review-next-up";
import { ReviewProfileShell } from "./review-profile-shell";
import { nextInQueue, QUEUE_GROUP_TITLES } from "./review-queue";
import { ReviewViewOnlyNote } from "./review-view-only-note";
import { type ReviewItem, reviewItemKey, streamOf } from "./types";

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
	/** Desktop with the list hidden: a centered deck, the next two peeking above, the buttons in a row below. */
	focus?: boolean;
}

// The card leaves toward the decision (pass left, intro right, maybe down); picking someone else just fades.
const EXIT = { pass: -1, intro: 1 } as const;
const cardMotion = {
	initial: { opacity: 0, y: 12, scale: 0.98 },
	animate: { opacity: 1, y: 0, scale: 1 },
	exit: (move: "pass" | "intro" | "maybe" | null) =>
		move === "maybe"
			? { opacity: 0, y: "30%" }
			: {
					opacity: 0,
					x: `${(move ? EXIT[move] : 0) * 110}%`,
					rotate: (move ? EXIT[move] : 0) * 6,
				},
};
// Focus: the next card rises from where the nearest peek was.
const focusCardMotion = { ...cardMotion, initial: { opacity: 0.9, y: -24, scale: 0.955 } };
// Farthest, then nearest.
const PEEK_CLASSES = ["absolute inset-x-8 top-0 h-20 opacity-80", "absolute inset-x-4 top-6 h-20"];
const STAMP =
	"pointer-events-none absolute z-10 rounded-v2-md border-3 bg-v2-bg-card px-3 py-1 font-bold font-v2-heading text-xl uppercase tracking-wider";
const fadeMotion = {
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
};

export function ReviewDeckStage({
	orgId,
	selectedRoleId,
	viewerIsPlatformAdmin = false,
	canDecide,
	expanded,
	onExpandedChange,
	swipe = false,
	decisionsInSheet = false,
	focus = false,
}: ReviewDeckStageProps) {
	const board = useReviewBoardContext();
	const item = board.selected;
	const key = item ? reviewItemKey(item) : "none";
	const reduceMotion = useReducedMotion();
	const similar = item ? board.similarTo.get(key) : undefined;
	const index = board.items.findIndex((i) => reviewItemKey(i) === key);
	const behind = expanded || focus ? 0 : Math.min(2, board.items.length - 1 - index);
	// Who comes after a decision: the same pick as the board's advance().
	const next = nextInQueue<ReviewItem>(board.items, index, () => false, board.isFailed) ?? undefined;
	// The two after that, in the order advance() walks: on down the list, then back up from the end.
	const upcoming =
		focus && index >= 0 ? [...board.items.slice(index + 1), ...board.items.slice(0, index).reverse()].slice(0, 2) : [];
	const chips = item ? board.chipsFor(item.talentId) : null;
	const { onCardVisible } = board;
	// The list may be hidden, so the card asks for its own company chips.
	useEffect(() => {
		if (item) onCardVisible(item.talentId);
	}, [item, onCardVisible]);

	// Phone swipe: the card tilts with the drag and a stamp shows where it'll go.
	const dragX = useMotionValue(0);
	const dragY = useMotionValue(0);
	const tilt = useTransform(dragX, (x) => x / 28);
	const introStamp = useTransform(dragX, [0, 100], [0, 1]);
	const passStamp = useTransform(dragX, [-100, 0], [1, 0]);
	const maybeStamp = useTransform(() => (Math.abs(dragX.get()) < 60 ? Math.min(1, Math.max(0, dragY.get() / 100)) : 0));

	const decisions =
		item &&
		(!canDecide ? (
			<ReviewViewOnlyNote />
		) : (
			<ReviewDecisionPopover orgId={orgId} disabled={decisionsInSheet}>
				<div>
					{/* Their decision didn't save: say so on the card itself, with the same Try again as the list. */}
					{board.isFailed(item) && (
						<ErrorBanner
							icon={<WarningCircle size={16} className="shrink-0" />}
							action={{ label: "Try again", onClick: () => board.retry(item) }}
							className={cn("mb-2", !focus && "mx-4 mt-3")}
						>
							Not saved. Your decision on {item.talentName.split(" ")[0]} didn't go through.
						</ErrorBanner>
					)}
					<TalentDecisionActionBar
						alreadyInterested={streamOf(item.bucket) === "interest"}
						isPending={board.isPending(item)}
						onInterview={() => board.openIntro(item)}
						onPass={() => board.openPass(item)}
						middleAction={
							<ReviewMaybeButton item={item} isPending={board.isPending(item)} disabled={decisionsInSheet} />
						}
						leadingAction={
							viewerIsPlatformAdmin ? (
								<AdminPassButton orgId={orgId} item={item} roleId={selectedRoleId} iconOnly />
							) : undefined
						}
						className={focus ? "border-t-0 px-0 py-0" : undefined}
					/>
					{next && !swipe && !focus && <ReviewNextUp item={next} />}
				</div>
			</ReviewDecisionPopover>
		));

	return (
		<div className={cn("flex flex-col gap-3", expanded && "h-full", focus && "mx-auto w-full max-w-175")}>
			<div className={cn("relative", expanded && "min-h-0 flex-1", focus && "pt-12")}>
				{/* Farthest first, so the next person paints on top, right behind the card. */}
				{[...upcoming].reverse().map((peek, i) => (
					<motion.div
						key={reviewItemKey(peek)}
						aria-hidden="true"
						initial={reduceMotion ? false : { opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.22, delay: 0.08 }}
						className={cn(
							"rounded-v2-lg border border-v2-border-warm bg-v2-bg-card shadow-v2-content",
							PEEK_CLASSES[i + 2 - upcoming.length],
						)}
					>
						<p className="flex h-6 items-center gap-2 px-4 font-v2-body text-v2-text-tertiary text-xs">
							<UserAvatar src={peek.talentAvatarUrl} name={peek.talentName} generated size="xs" className="shrink-0" />
							<span className="min-w-0 truncate">
								<b className="font-medium text-v2-text-secondary">{peek.talentName}</b> ·{" "}
								{QUEUE_GROUP_TITLES[streamOf(peek.bucket)]}
							</span>
						</p>
					</motion.div>
				))}
				{REVIEW_DECK_GHOST_CLASSES.slice(2 - behind).map((ghost) => (
					<div key={ghost} aria-hidden="true" className={ghost} />
				))}
				<AnimatePresence initial={false} mode="popLayout" custom={board.lastMove}>
					<motion.div
						key={key}
						// A decision removes the focused button with the old card; land focus on this card, not the page.
						// ponytail: waits out the 220ms exit animation; tie it to onExitComplete if that timing changes.
						ref={(el) => {
							if (!el || !item) return;
							setTimeout(() => {
								if (el.isConnected && (!document.activeElement || document.activeElement === document.body))
									el.focus({ preventScroll: true });
							}, 300);
						}}
						tabIndex={-1}
						// A named group, so a screen reader says who is next when focus lands here.
						role="group"
						aria-label={item?.talentName}
						custom={board.lastMove}
						variants={reduceMotion ? fadeMotion : focus ? focusCardMotion : cardMotion}
						initial="initial"
						animate="animate"
						exit="exit"
						transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
						// Full profile scrolls, so it only drags sideways there (a free drag blocks touch scrolling).
						drag={swipe && canDecide && !!item ? (expanded ? "x" : true) : false}
						dragSnapToOrigin
						onDrag={(_, { offset }) => {
							dragX.set(offset.x);
							dragY.set(offset.y);
						}}
						onDragEnd={(_, { offset }) => {
							animate(dragX, 0);
							animate(dragY, 0);
							if (!item) return;
							const distance = Math.min(110, window.innerWidth * 0.25);
							if (offset.x > distance) board.openIntro(item);
							else if (offset.x < -distance) board.openPass(item);
							else if (offset.y > 100 && Math.abs(offset.x) < 60) board.openMaybe(item);
						}}
						className={cn("relative outline-none", expanded && "h-full")}
					>
						<motion.div style={{ rotate: tilt }} className={cn(expanded && "h-full")}>
							{swipe && (
								<>
									<motion.span
										style={{ opacity: introStamp }}
										className={cn(STAMP, "top-5 right-5 rotate-10 text-v2-status-active")}
									>
										Intro
									</motion.span>
									<motion.span
										style={{ opacity: passStamp }}
										className={cn(STAMP, "top-5 left-5 -rotate-10 text-v2-status-error")}
									>
										Pass
									</motion.span>
									<motion.span
										style={{ opacity: maybeStamp }}
										className={cn(STAMP, "bottom-5 left-1/2 -translate-x-1/2 text-v2-status-warning")}
									>
										Maybe
									</motion.span>
								</>
							)}
							{/* Phone: clip, not hidden, so the decision bar can stick to the bottom of the screen (thumb zone). */}
							<Card
								className={cn(
									"p-0 max-lg:overflow-clip lg:overflow-hidden",
									expanded && "h-full",
									focus && "shadow-v2-content",
								)}
							>
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
									profileTop={item ? <ReviewFitReason reason={item.fitReason} /> : null}
									profileBelowHeader={
										chips && (
											<TalentEntityChips companies={chips.companies} isLoading={chips.isLoading} className="mt-2" />
										)
									}
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
												<div className="flex justify-end border-t border-v2-border-warm/50 px-4 py-1.5 sm:px-5">
													<Button
														variant="unstyled"
														size="unstyled"
														aria-expanded={expanded}
														onClick={() => onExpandedChange(!expanded)}
														className="focus-ring flex min-h-6 items-center gap-1.5 rounded-v2-sm font-v2-body font-medium text-v2-text-brand text-xs"
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
									footer={focus ? undefined : decisions}
									unboxed={focus}
								/>
							</Card>
						</motion.div>
					</motion.div>
				</AnimatePresence>
			</div>
			{focus && decisions}
		</div>
	);
}

ReviewDeckStage.displayName = "ReviewDeckStage";
