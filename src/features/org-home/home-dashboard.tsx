"use client";

import { extractFitReasonHook } from "@clera/shared-utils";
import { orgRoutes } from "@clera/route-factory";
import { ArrowRight, CaretRight, CheckCircle, Lightning } from "@phosphor-icons/react";
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
import { HomeNextSteps } from "./home-next-steps";
import {
	arrivedThisWeek,
	askedToMeet,
	type CompanySetup,
	deadlineElsewhere,
	nextSteps,
	waitingTotal,
} from "./home-summary";

const STAGES = ["requested", "introduced", "interviewing", "offer", "hired"] as const;
const TILE_CLASSES = "flex flex-col gap-0.5 px-4 py-3.5 text-left max-lg:px-3 max-lg:py-2.5";
const withView = (href: string, view: string) => `${href}${href.includes("?") ? "&" : "?"}view=${view}`;

function useHome(orgId: string, setup: CompanySetup) {
	const feedQuery = useQuery(reviewFeedQueryOptions(orgId));
	const { data: roles } = useRolesList(orgId, false);
	const { readinessFor } = useRoleIntroReadiness(orgId);
	const feed = feedQuery.data;
	if (!feed || !roles) return { ...feedQuery, home: null };
	const waiting = feed.items.filter((i) => !i.maybe);
	const steps = nextSteps({ feed, roles, readinessFor, setup });
	return {
		...feedQuery,
		home: {
			feed,
			roles,
			readinessFor,
			steps,
			waiting: waitingTotal(feed),
			arrived: arrivedThisWeek(waiting),
			caughtUp: !steps.some((s) => s.kind !== "profile" && s.kind !== "ats"),
		},
	};
}

/** The page's answer line: how much needs you, and what we sent this week. */
export function HomeAnswerLine({ orgId, setup }: { orgId: string; setup: CompanySetup }) {
	const { home } = useHome(orgId, setup);
	if (!home) return <Skeleton className="mt-0.5 h-4 w-64" />;
	if (home.caughtUp) return <span className="font-medium text-v2-text-primary">You're all caught up.</span>;
	const n = home.steps.length;
	return (
		<>
			<span className="font-medium text-v2-text-primary">
				{n} {n === 1 ? "thing needs" : "things need"} you
			</span>{" "}
			· We sent you {home.arrived.length} {home.arrived.length === 1 ? "candidate" : "candidates"} this week
		</>
	);
}

/** Home: what needs you this week. Fixes first, then the candidates waiting longest, with every role at a glance. */
export function HomeDashboard({ orgId, setup, canEdit }: { orgId: string; setup: CompanySetup; canEdit: boolean }) {
	const { home, isError, refetch } = useHome(orgId, setup);
	if (!home)
		return isError ? (
			<Card className="flex flex-col items-center gap-3 px-6 py-10 text-center">
				<p className="font-v2-body text-sm text-v2-text-secondary">Couldn't load what's waiting on you.</p>
				<Button variant="ghost" size="compact" onClick={() => refetch()}>
					Try again
				</Button>
			</Card>
		) : (
			<HomeDashboardSkeleton />
		);

	const { feed, roles, readinessFor, steps } = home;
	const reviewHref = orgRoutes.review(orgId);
	const asked = askedToMeet(feed.items);
	const deadline = deadlineElsewhere(feed.items);

	return (
		<div className="flex flex-col gap-4 max-lg:gap-3">
			<WeekTiles orgId={orgId} feed={feed} waiting={home.waiting} arrived={home.arrived.length} />
			<div className="grid items-start gap-4 max-lg:gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
				<div className="flex min-w-0 flex-col gap-4 max-lg:gap-3">
					{steps.length > 0 && <HomeNextSteps orgId={orgId} steps={steps} canEdit={canEdit} />}
					{home.caughtUp ? (
						<CaughtUp week={feed.decidedThisWeek} />
					) : (
						asked.length + deadline.length > 0 && (
							<HomeCard title="Asked to meet you" hint={STREAM_CONFIG.interest.tooltip} note="Longest wait first">
								{asked.slice(0, 3).map((item) => (
									<TalentRow key={`${item.talentId}:${item.roleId}`} orgId={orgId} item={item} />
								))}
								{asked.length === 0 && (
									<p className="px-4 py-3 font-v2-body text-sm text-v2-text-tertiary">
										Nobody's waiting on an intro reply.
									</p>
								)}
								{asked.length > 3 && (
									<CardFooter href={reviewHref} action="See all">
										+{asked.length - 3} more asked to meet you
									</CardFooter>
								)}
								{deadline.map((item) => (
									<CardFooter
										key={`${item.talentId}:${item.roleId}`}
										href={orgRoutes.review(orgId, item.roleId ?? undefined, item.talentId)}
										action="Open"
									>
										<span className="font-medium text-v2-text-secondary">{item.talentName}</span> · Why now:{" "}
										{extractFitReasonHook(item.fitReason)}
									</CardFooter>
								))}
							</HomeCard>
						)
					)}
				</div>
				<RolesCard orgId={orgId} feed={feed} roles={roles} readinessFor={readinessFor} arrived={home.arrived} />
			</div>
		</div>
	);
}

HomeDashboard.displayName = "HomeDashboard";

function WeekTiles({
	orgId,
	feed,
	waiting,
	arrived,
}: {
	orgId: string;
	feed: ReviewListData;
	waiting: number;
	arrived: number;
}) {
	const reviewHref = orgRoutes.review(orgId);
	const { intro, maybe, pass } = feed.decidedThisWeek;
	const maybes = feed.items.filter((i) => i.maybe).length;
	const link = "text-v2-text-brand hover:underline";
	return (
		<Card className="grid grid-cols-3 divide-x divide-v2-border-divider">
			<Link href={reviewHref} className={`${TILE_CLASSES} transition-colors hover:bg-v2-bg-warm`}>
				<TileValue label="Waiting on you" short="Waiting" value={waiting} />
				<span className="font-v2-body text-v2-text-tertiary text-xs tabular-nums max-sm:hidden">
					{arrived} new this week
				</span>
			</Link>
			<div className={TILE_CLASSES}>
				<TileValue label="You decided this week" short="Decided" value={intro + maybe + pass} />
				<span className="font-v2-body text-v2-text-tertiary text-xs tabular-nums max-sm:hidden">
					{intro} intro ·{" "}
					<Link href={withView(reviewHref, "maybe")} className={link}>
						{maybe} maybe
					</Link>{" "}
					·{" "}
					<Link href={withView(reviewHref, "passed")} className={link}>
						{pass} pass
					</Link>
				</span>
			</div>
			<Link href={withView(reviewHref, "maybe")} className={`${TILE_CLASSES} transition-colors hover:bg-v2-bg-warm`}>
				<TileValue label="Maybe" short="Maybe" value={maybes} />
				<span className="font-v2-body text-v2-text-tertiary text-xs max-sm:hidden">
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
		<div className="border-v2-border-divider border-t first:border-t-0">
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
}: {
	orgId: string;
	feed: ReviewListData;
	roles: { id: string; position: string; status: string; pipelineStages?: Partial<Record<string, number>> }[];
	readinessFor: (roleId: string) => { ready: boolean; reason?: "no_hm" | "hm_no_link" };
	arrived: ReviewItem[];
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
			{rows.map(({ role, paused, count, flag, truncated }) => {
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
						{count === 0 && !flag && <span>Nobody new yet</span>}
					</RoleRow>
				);
			})}
			{unassigned > 0 && (
				<RoleRow href={orgRoutes.review(orgId)} name="No role yet" count={unassigned}>
					<span>Pick a role in Review</span>
				</RoleRow>
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
			className="flex items-center gap-2.5 border-v2-border-divider border-t px-4 py-2.5 transition-colors first-of-type:border-t-0 hover:bg-v2-bg-warm max-lg:px-3"
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
			</span>
			<CaretRight size={12} className="shrink-0 text-v2-text-tertiary" />
		</Link>
	);
}

/** One quiet line under a card: who else is waiting, and where to see them. */
function CardFooter({ href, action, children }: { href: string; action: string; children: ReactNode }) {
	return (
		<div className="flex items-center gap-3 border-v2-border-divider border-t px-4 py-2.5 font-v2-body text-v2-text-tertiary text-xs max-lg:px-3">
			<p className="min-w-0 flex-1 truncate">{children}</p>
			<Link href={href} className="flex shrink-0 items-center gap-1 font-medium text-v2-text-brand hover:underline">
				{action} <ArrowRight size={12} />
			</Link>
		</div>
	);
}

function CaughtUp({ week }: { week: ReviewListData["decidedThisWeek"] }) {
	return (
		<Card className="flex flex-col items-center px-6 py-8 text-center">
			<span className="mb-3 grid size-10 place-items-center rounded-full bg-v2-status-success-bg text-v2-text-brand-green">
				<CheckCircle size={20} />
			</span>
			<h2 className="font-v2-heading text-lg text-v2-text-primary">Nice, you're all done</h2>
			<p className="mt-1 max-w-sm font-v2-body text-sm text-v2-text-secondary">
				Every candidate has a decision. New drops and intro requests land here.
			</p>
			<div className="mt-4 flex flex-wrap justify-center gap-2 font-v2-body text-v2-text-secondary text-xs tabular-nums">
				{(
					[
						[week.intro, "intros requested"],
						[week.maybe, "to revisit"],
						[week.pass, "passed"],
					] as const
				).map(([n, label]) => (
					<span key={label} className="flex items-baseline gap-1 rounded-full bg-v2-bg-warm px-2.5 py-1">
						<b className="font-semibold text-sm text-v2-text-primary">{n}</b>
						{label}
					</span>
				))}
				<span className="rounded-full bg-v2-bg-warm px-2.5 py-1">this week</span>
			</div>
		</Card>
	);
}

export function HomeDashboardSkeleton() {
	return (
		<div className="flex flex-col gap-4 max-lg:gap-3" aria-busy="true">
			<Skeleton className="h-20 w-full rounded-v2-lg" />
			<div className="grid items-start gap-4 max-lg:gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
				<div className="flex flex-col gap-4 max-lg:gap-3">
					<Skeleton className="h-64 w-full rounded-v2-lg" />
					<Skeleton className="h-72 w-full rounded-v2-lg" />
				</div>
				<Skeleton className="h-80 w-full rounded-v2-lg" />
			</div>
		</div>
	);
}
