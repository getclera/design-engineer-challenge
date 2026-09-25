"use client";

import { useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@v2/components/data-display";
import { Card } from "@v2/components/ui/card";
import { TooltipProvider } from "@v2/components/ui/tooltip";
import { useTalentBoardOpen, useTalentDecisionKeyboard } from "@v2/features/org-shared-cards";
import { prefetchOrgTalentProfile } from "@v2/features/org-talent-profile";
import { useMediaQuery } from "@v2/hooks/use-media-query";
import { usePersistFilterParams } from "@v2/hooks/use-persisted-search";
import { CaretRight, Cards, Coffee, SidebarSimple } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { cn } from "@v2/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SendoutListEntry } from "@/services/api/organizations";
import {
	ALL_ROLES_PARAM,
	ORG_REVIEW_FILTER_PARAMS,
	orgReviewFiltersKey,
	REVIEW_BOARD_COLUMNS,
	REVIEW_BOARD_GRID_CLASSES,
	REVIEW_BOARD_MAX_W,
	REVIEW_BOARD_MAX_W_NO_LIST,
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
import { ReviewMobileSheet } from "./review-mobile-sheet";
import { ReviewRoleFilter } from "./review-role-filter";
import { ReviewScopeBar } from "./review-scope-bar";
import { ReviewShortcutsHelp } from "./review-shortcuts-help";
import { ReviewStreamFilter } from "./review-stream-filter";
import { parseReviewStreams, serializeReviewStreams, setReviewUrlParams } from "./review-url";
import type { ReviewItem, ReviewStream } from "./types";

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
	const board = useReviewBoard(
		orgId,
		selectedRoleId,
		talentId,
		parseReviewStreams(streams),
		activeSendout?.talentIds,
		reviewView === "maybe",
	);
	const isMobile = useMediaQuery("(max-width: 1023px)");
	const queryClient = useQueryClient();
	const [mobileTalent, setMobileTalent] = useState<ReviewItem | null>(null);
	// Phone: the deck comes first; the list is one tap away.
	const [mobileList, setMobileList] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);
	usePrefetchNextProfile(orgId, board.items, board.selectedKey);

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
	useTalentDecisionKeyboard({
		selected: board.selected,
		enabled: !isMobile && !anyModalOpen,
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
	const showEmptyState = incomingEmpty;
	const showScopeBar = !!activeSendout || sendoutDrops.length > 0;

	return (
		<ReviewBoardProvider value={board}>
			<TooltipProvider delayDuration={150}>
				<div
					className={cn(
						"flex flex-col gap-3",
						listHidden && !isMobile ? REVIEW_BOARD_MAX_W_NO_LIST : REVIEW_BOARD_MAX_W,
					)}
				>
					{/* No positioned parent up to <main>, so the tab hangs on the app sidebar's edge, mid-screen. */}
					{listHidden && !isMobile && (
						<Button
							variant="unstyled"
							size="unstyled"
							aria-label="Show list"
							title="Show list (L)"
							onClick={() => setListHidden(false)}
							className="focus-ring absolute top-1/2 left-0 z-10 grid h-18 w-5.5 -translate-y-1/2 place-items-center rounded-r-v2-lg border border-v2-border-default border-l-0 bg-v2-bg-card text-v2-text-tertiary shadow-v2-content transition-[width] hover:w-7 hover:text-v2-text-primary"
						>
							<CaretRight size={16} />
						</Button>
					)}
					<div className={REVIEW_CONTROL_BAR_CLASSES}>
						<ReviewIncomingToggle view={reviewView} onChange={handleViewChange} />
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

					{board.loadFailed ? (
						<EmptyState
							live
							icon={<Coffee />}
							heading="Our server is on a coffee break"
							description="Your candidates are safe and nothing you decided is lost. We'll try again on our own."
							actions={
								<Button variant="ghost" onClick={() => board.retryLoad()}>
									Try now
								</Button>
							}
						/>
					) : reviewView === "passed" ? (
						<PassedView orgId={orgId} selectedRoleId={selectedRoleId} viewerIsPlatformAdmin={viewerIsPlatformAdmin} />
					) : board.isSwitching ? (
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
							/>
						</div>
					) : (
						<div
							className={cn(
								REVIEW_BOARD_GRID_CLASSES,
								listHidden && !isMobile ? "lg:grid-cols-1" : REVIEW_BOARD_COLUMNS,
							)}
						>
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
												items={board.items}
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
					)}
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
