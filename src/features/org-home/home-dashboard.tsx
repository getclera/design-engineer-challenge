"use client";

import { extractFitReasonHook } from "@clera/shared-utils";
import { orgRoutes } from "@clera/route-factory";
import { ArrowRight, CaretRight, Lightning } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@v2/components/ui/button";
import { Card } from "@v2/components/ui/card";
import { Skeleton } from "@v2/components/ui/skeleton";
import { StatusPill } from "@v2/components/ui/status-pill";
import { ReviewWaiting, STREAM_CONFIG, useRoleIntroReadiness } from "@v2/features/org-review";
import { useRolesList } from "@v2/features/org-roles";
import { TalentBoardCard } from "@v2/features/org-shared-cards";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { type ReviewItem, type ReviewListData, reviewFeedQueryOptions } from "@/lib/review-feed";
import { HomeCard } from "./home-card";
import { HomeExampleCandidate, HomeFirstDrop, HomeGetReady, type NextDrop } from "./home-day-one";
import { HomeMovingForward } from "./home-moving";
import { type CaughtUpWeek, HomeNextMoves, Lede } from "./home-next-steps";
import {
	applyHomeDemo,
	arrivedThisWeek,
	askedToMeet,
	type CompanySetup,
	type HomeDemo,
	type MovingForwardPerson,
	nextSteps,
	STEP_GROUP,
	stuckIntros,
	waitingTotal,
} from "./home-summary";

const STAGES = ["requested", "introduced", "interviewing", "offer", "hired"] as const;
const TILE_CLASSES = "flex flex-col gap-0.5 px-4 py-3.5 text-left max-lg:px-3 max-lg:py-2.5";
const ASKED_SHOWN = 3;
const ROLES_SHOWN = 5;
const withView = (href: string, view: string) => `${href}${href.includes("?") ? "&" : "?"}view=${view}`;
const firstName = (name: string) => name.split(" ")[0] || name;

function useHome(orgId: string) {
	const feedQuery = useQuery(reviewFeedQueryOptions(orgId));
	const rolesQuery = useRolesList(orgId, false);
	const { readinessFor } = useRoleIntroReadiness(orgId);
	return {
		feed: feedQuery.data,
		roles: rolesQuery.data,
		readinessFor,
		// Either one failing leaves Home with nothing to show: say so, and try both again.
		isError: feedQuery.isError || rolesQuery.isError,
		refetch: () => {
			if (feedQuery.isError) feedQuery.refetch();
			if (rolesQuery.isError) rolesQuery.refetch();
		},
	};
}

/**
 * Home, a weekly briefing. Left: what to do (Next moves, who asked to meet you). Right: how hiring is going
 * (Moving forward, Roles). Day 1, a quiet week and all done each get their own moment instead of an empty page.
 */
export function HomeDashboard({
	orgId,
	setup,
	canEdit,
	moving: realMoving,
	nextDrop,
	demo,
}: {
	orgId: string;
	setup: CompanySetup;
	canEdit: boolean;
	moving: MovingForwardPerson[];
	nextDrop: NextDrop;
	demo: HomeDemo | null;
}) {
	const { feed: realFeed, roles: realRoles, readinessFor: realReadiness, isError, refetch } = useHome(orgId);
	if (!realFeed || !realRoles)
		return isError ? (
			<Card role="alert" className="flex flex-col items-center gap-3 px-6 py-10 text-center">
				<p className="font-v2-body text-sm text-v2-text-secondary">Couldn't load what's waiting on you.</p>
				<Button variant="ghost" size="compact" onClick={() => refetch()}>
					Try again
				</Button>
			</Card>
		) : (
			<HomeDashboardSkeleton />
		);

	const { feed, roles, moving, allReady } = applyHomeDemo(demo, {
		feed: realFeed,
		roles: realRoles,
		moving: realMoving,
	});
	const readinessFor: typeof realReadiness = allReady ? () => ({ ready: true }) : realReadiness;
	const steps = nextSteps({ feed, roles, readinessFor, setup, stuck: stuckIntros(moving, readinessFor) });
	const waiting = waitingTotal(feed);
	const arrived = arrivedThisWeek(feed.items.filter((i) => !i.maybe));
	const { intro, maybe, pass } = feed.decidedThisWeek;
	const decided = intro + maybe + pass;
	const maybes = feed.items.filter((i) => i.maybe).length;
	// Nobody sent yet: nothing waiting, nothing decided, nobody past the intro.
	const dayOne = waiting === 0 && decided === 0 && moving.length === 0 && maybes === 0;
	const asked = askedToMeet(feed.items);
	const firstActive = roles.find((r) => r.status === "active");
	const caughtUp: CaughtUpWeek | null =
		!dayOne && !steps.some((s) => STEP_GROUP[s.kind] < 3)
			? {
					// Nothing to decide this week at all, vs. everyone decided.
					quiet: decided === 0,
					decided,
					intros: intro,
					maybes,
					nextDrop: nextDrop.day,
					quietRole: firstActive ? { id: firstActive.id, name: firstActive.position } : null,
				}
			: null;
	const stuckReason = (roleId: string) => {
		const r = readinessFor(roleId);
		if (r.ready) return null;
		return r.hmName
			? `Can't book a call yet: ${firstName(r.hmName)} has no scheduling link.`
			: "Can't book a call yet: this role has no hiring manager.";
	};

	return (
		<div className="flex flex-col gap-4 max-lg:gap-3">
			<WeekTiles
				orgId={orgId}
				feed={feed}
				waiting={waiting}
				hint={
					dayOne
						? `Your first drop arrives ${nextDrop.day}`
						: waiting === 0
							? caughtUp?.quiet
								? "Nobody new this week"
								: `New drops arrive ${nextDrop.day}`
							: `${arrived.length} new this week`
				}
			/>
			<div className="grid items-start gap-4 max-lg:gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
				<div className="flex min-w-0 flex-col gap-4 max-lg:gap-3">
					{dayOne ? (
						<>
							<HomeFirstDrop drop={nextDrop} roleName={roles[0]?.position ?? "your role"} />
							<HomeGetReady
								day={nextDrop.day}
								steps={[
									{
										key: "role",
										title: "Add your first role",
										meta: "So we know who to look for",
										action: "Add role",
										done: roles.length > 0,
									},
									{
										key: "link",
										title: "Add your scheduling link",
										meta: "So candidates can book a call directly",
										action: "Add link",
										done: roles.length > 0 && readinessFor(roles[0].id).ready,
									},
									{
										key: "profile",
										title: "Finish your company profile",
										meta: "Candidates read it before they say yes",
										action: "Finish",
										done: setup.profileMissing.length === 0,
									},
									{
										key: "ats",
										title: "Connect your ATS",
										meta: "Sync roles from Ashby, Greenhouse and more",
										action: "Connect",
										done: setup.atsConnected,
									},
								]}
							/>
							<HomeExampleCandidate day={nextDrop.day} />
						</>
					) : (
						<>
							<HomeNextMoves orgId={orgId} steps={steps} canEdit={canEdit} caughtUp={caughtUp} />
							{asked.length > 0 ? (
								<HomeCard
									title="Asked to meet you"
									hint={STREAM_CONFIG.interest.tooltip}
									note={`${asked.length} waiting`}
								>
									{asked.slice(0, ASKED_SHOWN).map((item) => (
										<TalentRow key={`${item.talentId}:${item.roleId}`} orgId={orgId} item={item} />
									))}
									{asked.length > ASKED_SHOWN && (
										<CardFooter href={orgRoutes.review(orgId)} action="See all">
											+{asked.length - ASKED_SHOWN} more asked to meet you
										</CardFooter>
									)}
								</HomeCard>
							) : (
								caughtUp?.quiet && (
									<HomeCard title="Asked to meet you" note="Nobody yet">
										<Lede>When someone sees your role and asks to meet you, they show up here first.</Lede>
										<CardFooter href={orgRoutes.roles.list(orgId)} action="Open your roles" />
									</HomeCard>
								)
							)}
						</>
					)}
				</div>
				<div className="flex min-w-0 flex-col gap-4 max-lg:gap-3">
					<HomeMovingForward orgId={orgId} people={moving} stuckReason={stuckReason} nextDrop={nextDrop.day} />
					<RolesCard
						orgId={orgId}
						feed={feed}
						roles={roles}
						readinessFor={readinessFor}
						arrived={arrived}
						emptyLabel={
							dayOne
								? `First candidates on the way · ${nextDrop.day}`
								: caughtUp?.quiet
									? "Still searching"
									: "Nobody new yet"
						}
					/>
				</div>
			</div>
		</div>
	);
}

HomeDashboard.displayName = "HomeDashboard";

function WeekTiles({
	orgId,
	feed,
	waiting,
	hint,
}: {
	orgId: string;
	feed: ReviewListData;
	waiting: number;
	hint: string;
}) {
	const reviewHref = orgRoutes.review(orgId);
	const { intro, maybe, pass } = feed.decidedThisWeek;
	const maybes = feed.items.filter((i) => i.maybe).length;
	// Inline, but with a 24px+ hit area.
	const link = "-my-1.5 inline-block py-1.5 text-v2-text-brand hover:underline";
	return (
		<Card className="grid grid-cols-3 divide-x divide-v2-border-divider">
			<Link href={reviewHref} className={`${TILE_CLASSES} transition-colors hover:bg-v2-bg-warm`}>
				<TileValue label="Waiting on you" short="Waiting" value={waiting} />
				<span className="font-v2-body text-v2-text-tertiary text-xs tabular-nums">{hint}</span>
			</Link>
			<div className={TILE_CLASSES}>
				<TileValue label="You decided this week" short="Decided" value={intro + maybe + pass} />
				<span className="font-v2-body text-v2-text-tertiary text-xs tabular-nums">
					{intro + maybe + pass === 0 ? (
						"Nothing yet"
					) : (
						<>
							{intro} intro ·{" "}
							<Link href={withView(reviewHref, "maybe")} className={link}>
								{maybe} maybe
							</Link>{" "}
							·{" "}
							<Link href={withView(reviewHref, "passed")} className={link}>
								{pass} pass
							</Link>
						</>
					)}
				</span>
			</div>
			<Link href={withView(reviewHref, "maybe")} className={`${TILE_CLASSES} transition-colors hover:bg-v2-bg-warm`}>
				<TileValue label="Maybe" short="Maybe" value={maybes} />
				<span className="font-v2-body text-v2-text-tertiary text-xs">
					{maybes > 0 ? "Parked. Decide whenever." : "No maybes yet"}
				</span>
			</Link>
		</Card>
	);
}

function TileValue({ label, short, value }: { label: string; short: string; value: number }) {
	return (
		<>
			<span className="truncate font-v2-body text-v2-text-tertiary text-xs">
				<span className="max-sm:hidden">{label}</span>
				<span className="sm:hidden">{short}</span>
			</span>
			<span className="font-semibold font-v2-body text-2xl text-v2-text-primary tabular-nums leading-tight max-lg:text-xl">
				{value}
			</span>
		</>
	);
}

/** Same row as Review's list: opens that person in Review. */
function TalentRow({ orgId, item }: { orgId: string; item: ReviewItem }) {
	const router = useRouter();
	const href = orgRoutes.review(orgId, item.roleId ?? undefined, item.talentId);
	const hook = extractFitReasonHook(item.fitReason);
	return (
		<div className="border-v2-border-divider border-t">
			<TalentBoardCard
				item={{
					name: item.talentName,
					avatarUrl: item.talentAvatarUrl,
					subtitle: item.talentOneliner,
					companies: item.companies,
					school: item.school,
				}}
				isSelected={false}
				onSelect={() => router.push(href)}
				onPrefetch={() => router.prefetch(href)}
				badge={<ReviewWaiting item={item} />}
				footer={
					hook && (
						<p className="flex min-w-0 items-center gap-1.5 font-v2-body text-v2-text-brand text-xs">
							<Lightning size={12} className="shrink-0" />
							<span className="truncate">{hook}</span>
						</p>
					)
				}
			/>
		</div>
	);
}

function RolesCard({
	orgId,
	feed,
	roles,
	readinessFor,
	arrived,
	emptyLabel,
}: {
	orgId: string;
	feed: ReviewListData;
	roles: { id: string; position: string; status: string; pipelineStages?: Partial<Record<string, number>> }[];
	readinessFor: (roleId: string) => { ready: boolean; reason?: "no_hm" | "hm_no_link" };
	arrived: ReviewItem[];
	emptyLabel: string;
}) {
	const unassigned = feed.items.filter((i) => !i.maybe && !i.roleId).length;
	const rows = roles
		.map((role) => {
			const paused = role.status === "paused";
			const count = paused ? (feed.pausedPending[role.id] ?? 0) : (feed.byRole[role.id]?.pending ?? 0);
			const readiness = readinessFor(role.id);
			// Review's own role notes. The intro still goes out; candidates just can't book directly.
			const flag = paused
				? "Paused"
				: count > 0 && !readiness.ready
					? readiness.reason === "no_hm"
						? "No hiring manager"
						: "No scheduling link"
					: null;
			return { role, paused, count, flag, truncated: !!feed.byRole[role.id]?.truncated };
		})
		.sort((a, b) => Number(!!b.flag) - Number(!!a.flag) || b.count - a.count);
	return (
		<HomeCard title="Roles" note={`${roles.filter((r) => r.status === "active").length} open`}>
			{rows.slice(0, ROLES_SHOWN).map(({ role, paused, count, flag, truncated }) => {
				const fresh = arrived.filter((i) => i.roleId === role.id).length;
				const stages = STAGES.flatMap((s) => (role.pipelineStages?.[s] ? [`${role.pipelineStages[s]} ${s}`] : []));
				return (
					<RoleRow
						key={role.id}
						href={orgRoutes.review(orgId, role.id)}
						name={role.position}
						count={count}
						plus={truncated}
						quiet={count === 0}
					>
						{flag && (
							<StatusPill tone={paused ? "info" : "warning"} size="xs">
								{flag}
							</StatusPill>
						)}
						{fresh > 0 && <span className="text-v2-text-brand-green">+{fresh} new</span>}
						{stages.length > 0 && <span>{stages.join(" · ")}</span>}
						{count === 0 && !flag && stages.length === 0 && <span>{emptyLabel}</span>}
					</RoleRow>
				);
			})}
			{unassigned > 0 && (
				<RoleRow href={orgRoutes.review(orgId)} name="No role yet" count={unassigned}>
					<span>Pick a role in Review</span>
				</RoleRow>
			)}
			{rows.length > ROLES_SHOWN && (
				<CardFooter href={orgRoutes.roles.list(orgId)} action="See all">
					+{rows.length - ROLES_SHOWN} more roles
				</CardFooter>
			)}
		</HomeCard>
	);
}

function RoleRow({
	href,
	name,
	count,
	plus = false,
	quiet = false,
	children,
}: {
	href: string;
	name: string;
	count: number;
	plus?: boolean;
	quiet?: boolean;
	children: ReactNode;
}) {
	return (
		<Link
			href={href}
			className="flex items-center gap-2.5 border-v2-border-divider border-t px-4 py-2.5 transition-colors hover:bg-v2-bg-warm max-lg:px-3"
		>
			<div className="min-w-0 flex-1">
				<p
					className={`truncate font-v2-body text-sm ${quiet ? "text-v2-text-tertiary" : "font-medium text-v2-text-primary"}`}
				>
					{name}
				</p>
				<div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 font-v2-body text-v2-text-tertiary text-xs tabular-nums">
					{children}
				</div>
			</div>
			<span
				className={`font-v2-body text-sm tabular-nums ${quiet ? "text-v2-text-tertiary" : "font-semibold text-v2-text-primary"}`}
			>
				{count}
				{plus && "+"}
				<span className="sr-only"> waiting</span>
			</span>
			<CaretRight size={12} className="shrink-0 text-v2-text-tertiary" />
		</Link>
	);
}

/** One quiet line under a card: who else is waiting, and where to see them. */
function CardFooter({ href, action, children }: { href: string; action: string; children?: ReactNode }) {
	return (
		<div className="flex items-center gap-3 border-v2-border-divider border-t px-4 py-2.5 font-v2-body text-v2-text-tertiary text-xs max-lg:px-3">
			<p className="min-w-0 flex-1 truncate">{children}</p>
			<Link
				href={href}
				className="-my-2 flex shrink-0 items-center gap-1 py-2 font-medium text-v2-text-brand hover:underline"
			>
				{action} <ArrowRight size={12} />
			</Link>
		</div>
	);
}

export function HomeDashboardSkeleton() {
	return (
		<div className="flex flex-col gap-4 max-lg:gap-3" role="status" aria-label="Loading Home" aria-busy="true">
			<Skeleton className="h-20 w-full rounded-v2-lg" />
			<div className="grid items-start gap-4 max-lg:gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
				<div className="flex flex-col gap-4 max-lg:gap-3">
					<Skeleton className="h-64 w-full rounded-v2-lg" />
					<Skeleton className="h-72 w-full rounded-v2-lg" />
				</div>
				<div className="flex flex-col gap-4 max-lg:gap-3">
					<Skeleton className="h-72 w-full rounded-v2-lg" />
					<Skeleton className="h-64 w-full rounded-v2-lg" />
				</div>
			</div>
		</div>
	);
}
