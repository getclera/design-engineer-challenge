"use client";

import { useQueryClient } from "@tanstack/react-query";
import { EmptyState, useCollapsedGroups } from "@v2/components/data-display";
import { Card } from "@v2/components/ui/card";
import { TooltipProvider } from "@v2/components/ui/tooltip";
import { useTalentBoardOpen, useTalentDecisionKeyboard } from "@v2/features/org-shared-cards";
import { prefetchOrgTalentProfile } from "@v2/features/org-talent-profile";
import { useMediaQuery } from "@v2/hooks/use-media-query";
import { usePersistFilterParams } from "@v2/hooks/use-persisted-search";
import { CaretRight, Cards, SidebarSimple, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { cn } from "@v2/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SendoutListEntry } from "@/services/api/organizations";
import {
	ALL_ROLES_PARAM,
	ORG_REVIEW_FILTER_PARAMS,
	orgReviewFiltersKey,
	REVIEW_BOARD_GRID_CLASSES,
	REVIEW_CONTROL_BAR_CLASSES,
	REVIEW_LEFT_CARD_CLASSES,
} from "./constants";
import { HmRequiredModal } from "./hm-required-modal";
import { useDefaultReviewRole } from "./hooks/use-default-review-role";
import { usePrefetchNextProfile } from "./hooks/use-prefetch-next-profile";
import { useReviewBoard } from "./hooks/use-review-board";
import { useSendoutLists } from "./hooks/use-sendout-lists";
import { PassedView } from "./passed-view";
import { ReviewBoardProvider } from "./review-board-context";
import { ReviewBoardGridSkeleton } from "./review-board-grid-skeleton";
import { ReviewBoardSkeleton } from "./review-board-skeleton";
import { ReviewDeckStage } from "./review-deck-stage";
import { ReviewEmpty } from "./review-empty";
import { ReviewHeader } from "./review-header";
import { ReviewIncomingToggle, type ReviewView } from "./review-incoming-toggle";
import { ReviewLeftList } from "./review-left-list";
import { queueSections, stepNavigable } from "./review-queue";
import { ReviewMobileSheet } from "./review-mobile-sheet";
import { ReviewRecap } from "./review-recap";
import { ReviewRoleFilter } from "./review-role-filter";
import { ReviewScopeBar } from "./review-scope-bar";
import { ReviewScoreboard } from "./review-scoreboard";
import { ReviewShortcutsHelp } from "./review-shortcuts-help";
import { ReviewStreamFilter } from "./review-stream-filter";
import { parseReviewStreams, serializeReviewStreams, setReviewUrlParams } from "./review-url";
import { REVIEW_STREAMS, type ReviewItem, type ReviewStream, reviewItemKey } from "./types";

interface ReviewBoardProps {
	orgId: string;
	roleParam?: string;
	talentId?: string;
	view?: string;
	streams?: string;
	sendoutNanoId?: string;
	sendoutTalentIds?: readonly string[];
	canUseTalentSearch: boolean;
	/** Viewers browse only: the server refuses their decisions, so we don't offer them. */
	canDecide?: boolean;
	viewerIsPlatformAdmin?: boolean;
}

const ignore = () => {};

export function ReviewBoard({
	orgId,
	roleParam,
	talentId,
	view,
	streams,
	sendoutNanoId,
	sendoutTalentIds,
	canUseTalentSearch,
	canDecide = true,
	viewerIsPlatformAdmin = false,
}: ReviewBoardProps) {
	const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(
		roleParam === ALL_ROLES_PARAM ? undefined : roleParam,
	);
	const [activeSendout, setActiveSendout] = useState<{ nanoId: string; talentIds: readonly string[] } | undefined>(
		sendoutNanoId && sendoutTalentIds ? { nanoId: sendoutNanoId, talentIds: sendoutTalentIds } : undefined,
	);
	const clearSendoutScope = useCallback(() => {
		setActiveSendout(undefined);
		setReviewUrlParams({ sendout: undefined });
	}, []);
	const selectSendout = useCallback((drop: SendoutListEntry) => {
		setActiveSendout({ nanoId: drop.nanoId, talentIds: drop.talentIds });
		setReviewUrlParams({ sendout: drop.nanoId });
	}, []);
	const handleRoleChange = useCallback(
		(next: string | undefined) => {
			setSelectedRoleId(next);
			setReviewUrlParams({ role: next ?? ALL_ROLES_PARAM });
			clearSendoutScope();
		},
		[clearSendoutScope],
	);
	usePersistFilterParams(orgReviewFiltersKey(orgId), ORG_REVIEW_FILTER_PARAMS);
	const applyDefaultRole = useCallback((param: string | undefined) => {
		setSelectedRoleId(param === ALL_ROLES_PARAM ? undefined : param);
		setReviewUrlParams({ role: param });
	}, []);
	useDefaultReviewRole(orgId, roleParam === undefined && !talentId, applyDefaultRole);
	const { data: sendoutDrops = [] } = useSendoutLists(orgId, selectedRoleId);
	const [reviewView, setReviewView] = useState<ReviewView>(view === "passed" || view === "maybe" ? view : "unreviewed");
	// Who's in a closed list group, for the board's ↑↓; set below once the groups are known.
	const hiddenRef = useRef<(item: ReviewItem) => boolean>(() => false);
	const board = useReviewBoard(
		orgId,
		selectedRoleId,
		talentId,
		parseReviewStreams(streams),
		activeSendout?.talentIds,
		reviewView === "maybe",
		hiddenRef,
	);
	const isMobile = useMediaQuery("(max-width: 1023px)");
	const queryClient = useQueryClient();
	const [mobileTalent, setMobileTalent] = useState<ReviewItem | null>(null);
	// Phone: the deck comes first; the list is one tap away.
	const [mobileList, setMobileList] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);

	const { selectedKey } = board;
	useEffect(() => {
		if (!selectedKey) return;
		listRef.current
			?.querySelector(`[data-board-key="${CSS.escape(selectedKey)}"]`)
			?.scrollIntoView({ block: "nearest" });
	}, [selectedKey]);

	const handlePrefetch = useCallback(
		(talentId: string) => prefetchOrgTalentProfile(queryClient, orgId, talentId),
		[queryClient, orgId],
	);
	const handleSelect = useCallback(
		(item: ReviewItem) => {
			board.selectItem(item);
			setMobileList(false); // phone: picking someone goes back to their card
		},
		[board],
	);
	const openTalent = useTalentBoardOpen(orgId, "review");
	const handleOpen = useCallback((item: ReviewItem) => openTalent(item.talentId), [openTalent]);
	const handleListIntro = useCallback(
		(item: ReviewItem) => {
			board.selectItem(item);
			board.openIntro(item);
		},
		[board],
	);
	const handleListPass = useCallback(
		(item: ReviewItem) => {
			board.selectItem(item);
			board.openPass(item);
		},
		[board],
	);
	const closeMobile = useCallback(() => setMobileTalent(null), []);
	const mobilePassRef = useRef(false);
	const mobilePanelWasOpen = useRef(false);
	const mobilePanelOpen = !!board.panel;
	useEffect(() => {
		if (mobilePanelOpen) {
			mobilePanelWasOpen.current = true;
			return;
		}
		if (mobilePanelWasOpen.current && mobilePassRef.current) {
			mobilePassRef.current = false;
			setMobileTalent(null);
		}
		mobilePanelWasOpen.current = false;
	}, [mobilePanelOpen]);

	const handleViewChange = useCallback((next: ReviewView) => {
		setReviewView(next);
		setReviewUrlParams({ view: next === "unreviewed" ? undefined : next });
	}, []);
	const { setStreams } = board;
	const handleStreamsChange = useCallback(
		(next: ReviewStream[]) => {
			setStreams(next);
			setReviewUrlParams({ streams: serializeReviewStreams(next) });
		},
		[setStreams],
	);

	// Screen-level view state the keyboard also drives: full profile (Space), list (L), shortcuts (?).
	const [listHidden, setListHidden] = useState(false);

	// List groups open and close, remembered per browser. Skipping only applies while the list is on screen:
	// in card view nobody should become unreachable.
	const groups = useCollapsedGroups("clera-review-groups");
	const listVisible = isMobile ? mobileList : !listHidden;
	const sections = useMemo(
		() =>
			queueSections(board.items, (item) => board.similarTo.get(reviewItemKey(item))?.anchor.talentName.split(" ")[0]),
		[board.items, board.similarTo],
	);
	const sectionOf = useMemo(
		() => new Map(sections.flatMap((section) => section.items.map((item) => [reviewItemKey(item), section.key]))),
		[sections],
	);
	const isHidden = useCallback(
		(item: ReviewItem) => listVisible && !groups.isOpen(sectionOf.get(reviewItemKey(item)) ?? ""),
		[listVisible, groups, sectionOf],
	);
	useEffect(() => {
		hiddenRef.current = isHidden;
	}, [isHidden]);
	usePrefetchNextProfile(
		orgId,
		useMemo(() => board.items.filter((item) => !isHidden(item)), [board.items, isHidden]),
		board.selectedKey,
	);
	const toggleGroup = useCallback(
		(key: string) => {
			const closing = groups.isOpen(key);
			groups.toggle(key);
			const selected = board.selectedKey;
			if (!closing || !selected || sectionOf.get(selected) !== key) return;
			// Closing the group you're in: move to the next person still visible.
			const hiddenNow = (item: ReviewItem) => {
				const section = sectionOf.get(reviewItemKey(item)) ?? "";
				return section === key || !groups.isOpen(section);
			};
			const idx = board.items.findIndex((item) => reviewItemKey(item) === selected);
			const target = stepNavigable(board.items, idx, 1, hiddenNow) ?? stepNavigable(board.items, idx, -1, hiddenNow);
			if (target) board.selectItem(target);
		},
		[groups, board, sectionOf],
	);
	const [helpOpen, setHelpOpen] = useState(false);
	const [fullProfile, setFullProfile] = useState(false);
	const [profileKey, setProfileKey] = useState(board.selectedKey);
	if (profileKey !== board.selectedKey) {
		setProfileKey(board.selectedKey);
		setFullProfile(false);
	}
	const handleScreenKey = useCallback(
		(key: string) => {
			if (key === " ") setFullProfile((open) => !open);
			else if (key === "l" || key === "L") setListHidden((hidden) => !hidden);
			else if (key === "?") setHelpOpen((open) => !open);
			else if (canDecide && (key === "z" || key === "Z")) board.undoLast();
			// Viewers can't decide, so ←/→ just move between people.
			else if (!canDecide && key === "ArrowRight") board.selectNext();
			else if (!canDecide && key === "ArrowLeft") board.selectPrev();
			else return false;
			return true;
		},
		[canDecide, board.selectNext, board.selectPrev, board.undoLast],
	);

	const anyModalOpen = !!board.rolePickerItem || board.hmWarningOpen;
	// A role switch keeps the old list up, faded, for a moment; the grey skeleton only if it's slow.
	const slowSwitch = useDelayedFlag(board.isSwitching, 300);
	const switching = board.isSwitching || slowSwitch;
	useTalentDecisionKeyboard({
		selected: board.selected,
		enabled: !isMobile && !anyModalOpen && !switching,
		panelOpen: !!board.panel || !!board.maybeItem,
		onIntro: canDecide ? board.openIntro : ignore,
		onOpenPass: canDecide ? board.openPass : ignore,
		onMaybe: canDecide ? board.openMaybe : undefined,
		onKey: handleScreenKey,
		onSelectPrev: board.selectPrev,
		onSelectNext: board.selectNext,
	});

	if (board.isLoading) {
		return <ReviewBoardSkeleton />;
	}

	const incomingEmpty = board.streamCounts.all === 0;
	// Everyone in view decided during this visit (an intro may still be held for its undo window): recap.
	const finished =
		reviewView === "unreviewed" &&
		board.items.length === 0 &&
		board.tally.total > 0 &&
		board.streams.length === REVIEW_STREAMS.length;
	const showEmptyState = incomingEmpty || finished;
	const showScopeBar = !!activeSendout || sendoutDrops.length > 0;

	return (
		<ReviewBoardProvider value={board}>
			<TooltipProvider delayDuration={150}>
				<div className="flex flex-col gap-3">
					{/* No positioned parent up to <main>, so the tab hangs on the app sidebar's edge, mid-screen. */}
					{listHidden && !isMobile && (
						<Button
							variant="unstyled"
							size="unstyled"
							aria-label="Show list"
							title="Show list (L)"
							onClick={() => setListHidden(false)}
							className="focus-ring absolute top-1/2 left-0 z-10 grid h-18 w-6 -translate-y-1/2 place-items-center rounded-r-v2-lg border border-v2-border-default border-l-0 bg-v2-bg-card text-v2-text-tertiary shadow-v2-content transition-[width] hover:w-7 hover:text-v2-text-primary"
						>
							<CaretRight size={16} />
						</Button>
					)}
					<div className={cn(REVIEW_CONTROL_BAR_CLASSES, "max-lg:gap-y-1.5")}>
						<ReviewIncomingToggle view={reviewView} onChange={handleViewChange} />
						{/* Phone: the tabs get their own row; role, type and the list button share the next one. */}
						{isMobile && <div aria-hidden className="basis-full" />}
						<ReviewRoleFilter orgId={orgId} roleId={selectedRoleId} byRole={board.byRole} onChange={handleRoleChange} />
						{reviewView !== "passed" && !incomingEmpty && (
							<ReviewStreamFilter streams={board.streams} counts={board.streamCounts} onChange={handleStreamsChange} />
						)}
						{isMobile && reviewView !== "passed" && (
							<Button
								variant="ghost"
								size="compact-icon"
								aria-label={mobileList ? "Show card" : "Show list"}
								aria-pressed={mobileList}
								onClick={() => setMobileList((open) => !open)}
								className="ml-auto"
							>
								{mobileList ? <Cards size={16} /> : <SidebarSimple size={16} />}
							</Button>
						)}
					</div>

					<div
						inert={switching}
						className={cn("flex flex-col gap-3 transition-opacity", switching && !slowSwitch && "opacity-50")}
					>
						{board.loadFailed ? (
							<EmptyState
								live
								icon={<WarningCircle />}
								heading="Couldn't load candidates"
								description="Nothing you decided is lost."
								actions={
									<Button variant="ghost" onClick={() => board.retryLoad()}>
										Try again
									</Button>
								}
							/>
						) : reviewView === "passed" ? (
							<PassedView orgId={orgId} selectedRoleId={selectedRoleId} viewerIsPlatformAdmin={viewerIsPlatformAdmin} />
						) : slowSwitch ? (
							<ReviewBoardGridSkeleton />
						) : showEmptyState ? (
							<div>
								{showScopeBar && (
									<ReviewScopeBar
										drops={sendoutDrops}
										activeNanoId={activeSendout?.nanoId}
										feedTalentIds={board.feedTalentIds}
										onSelect={selectSendout}
										onClear={clearSendoutScope}
										className="border-b border-v2-border-divider"
									/>
								)}
								<ReviewEmpty
									orgId={orgId}
									roleId={selectedRoleId}
									roleFeedCount={board.roleFeedCount}
									hasActiveSendout={!!activeSendout}
									canUseTalentSearch={canUseTalentSearch}
									byRole={board.byRole}
									pausedPending={board.pausedPending}
									onClearSendout={clearSendoutScope}
									onRoleChange={handleRoleChange}
									recap={
										board.tally.total > 0
											? (roleName) => (
													<ReviewRecap
														roleName={roleName}
														moreComing={board.truncated}
														tally={board.tally}
														decisions={board.decisions}
														onReviewMaybes={() => handleViewChange("maybe")}
													/>
												)
											: undefined
									}
								/>
							</div>
						) : (
							<>
								{reviewView === "unreviewed" && (
									<ReviewScoreboard left={board.items.length} truncated={board.truncated} tally={board.tally} />
								)}
								{board.refreshFailed && (
									<p role="status" className="font-v2-body text-v2-text-tertiary text-xs">
										Couldn't refresh. Trying again…
									</p>
								)}
								<div className={cn(REVIEW_BOARD_GRID_CLASSES, listHidden && !isMobile && "lg:grid-cols-1")}>
									{(isMobile && !mobileList) || (listHidden && !isMobile) ? null : (
										<Card className={REVIEW_LEFT_CARD_CLASSES}>
											{showScopeBar && (
												<ReviewScopeBar
													drops={sendoutDrops}
													activeNanoId={activeSendout?.nanoId}
													feedTalentIds={board.feedTalentIds}
													onSelect={selectSendout}
													onClear={clearSendoutScope}
													className="border-b border-v2-border-divider"
												/>
											)}
											<ReviewHeader
												maybe={reviewView === "maybe"}
												onHide={isMobile ? undefined : () => setListHidden(true)}
											/>
											<div
												ref={listRef}
												className="max-h-[calc(100dvh-16rem)] min-h-0 flex-1 overflow-y-auto lg:max-h-none"
											>
												{board.items.length === 0 ? (
													<EmptyState
														heading={
															reviewView === "maybe" ? "No maybes yet" : incomingEmpty ? "All reviewed" : "Nothing here"
														}
														description={
															reviewView === "maybe"
																? "Press M when you're unsure about someone. They wait here until you decide."
																: incomingEmpty
																	? "Nothing waiting on you for this role."
																	: "No candidates match this filter right now."
														}
													/>
												) : (
													<ReviewLeftList
														sections={sections}
														isOpen={groups.isOpen}
														onToggle={toggleGroup}
														selectedKey={board.selectedKey}
														onSelect={handleSelect}
														onOpen={isMobile ? undefined : handleOpen}
														onPrefetch={handlePrefetch}
														onIntro={isMobile || !canDecide ? undefined : handleListIntro}
														onPass={isMobile || !canDecide ? undefined : handleListPass}
														isPending={board.isPending}
														isFailed={board.isFailed}
														onRetry={board.retry}
														similarTo={board.similarTo}
														chipsFor={board.chipsFor}
														onCardVisible={board.onCardVisible}
														onCardSeen={board.onCardSeen}
													/>
												)}
												{reviewView === "unreviewed" && board.truncated && board.items.length > 0 && (
													<p className="px-4 py-3 text-center font-v2-body text-v2-text-tertiary text-xs">
														More arrive when you clear these
													</p>
												)}
											</div>
										</Card>
									)}
									{!(isMobile && mobileList) && (
										<div className="flex min-h-0 flex-col gap-2">
											<div className="min-h-0 flex-1">
												<ReviewDeckStage
													orgId={orgId}
													selectedRoleId={selectedRoleId}
													viewerIsPlatformAdmin={viewerIsPlatformAdmin}
													canDecide={canDecide}
													expanded={fullProfile}
													// Phone: the full profile is the live bottom sheet instead of growing the card.
													onExpandedChange={isMobile ? () => setMobileTalent(board.selected) : setFullProfile}
													swipe={isMobile}
													decisionsInSheet={!!mobileTalent}
													focus={listHidden && !isMobile}
												/>
											</div>
											{!isMobile && (
												<div className="flex justify-end">
													<ReviewShortcutsHelp open={helpOpen} onOpenChange={setHelpOpen} canDecide={canDecide} />
												</div>
											)}
										</div>
									)}
								</div>
							</>
						)}
					</div>
				</div>

				<ReviewMobileSheet
					orgId={orgId}
					canDecide={canDecide}
					talent={mobileTalent}
					open={!!mobileTalent && isMobile}
					isPending={mobileTalent ? board.isPending(mobileTalent) : false}
					onClose={closeMobile}
					onInterview={(item) => {
						mobilePassRef.current = true;
						board.openIntro(item);
					}}
					onPass={(item) => {
						mobilePassRef.current = true;
						board.openPass(item);
					}}
				/>

				<HmRequiredModal
					isOpen={board.hmWarningOpen}
					onOpenChange={(open) => {
						if (!open) board.closeHmWarning();
					}}
					onContinue={board.continueFromHmWarning}
					orgId={orgId}
					roleId={board.hmWarningRoleId}
					reason={board.hmWarningReason}
					hmName={board.hmWarningHmName}
					hmContactId={board.hmWarningHmContactId}
				/>
			</TooltipProvider>
		</ReviewBoardProvider>
	);
}

ReviewBoard.displayName = "ReviewBoard";

/** True once `flag` has stayed true for `ms`; once shown, it stays for at least `ms` more so it never flickers. */
function useDelayedFlag(flag: boolean, ms: number) {
	const [delayed, setDelayed] = useState(false);
	const shownAt = useRef(0);
	useEffect(() => {
		const timer = flag
			? setTimeout(() => {
					shownAt.current = Date.now();
					setDelayed(true);
				}, ms)
			: setTimeout(() => setDelayed(false), Math.max(0, shownAt.current + ms - Date.now()));
		return () => clearTimeout(timer);
	}, [flag, ms]);
	return delayed;
}
