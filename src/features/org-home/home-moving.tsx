"use client";

import { formatTimeAgoCompact } from "@clera/shared-utils";
import { orgRoutes } from "@clera/route-factory";
import { ArrowRight } from "@phosphor-icons/react";
import { UserAvatar } from "@v2/components/ui/avatar";
import { StatusPill } from "@v2/components/ui/status-pill";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { HomeCard } from "./home-card";
import { Lede } from "./home-next-steps";
import type { MovingForwardPerson, PipelineStage } from "./home-summary";

const SHOWN = 5;

const STAGE: Record<PipelineStage, { label: string; tone: "active" | "info" | "neutral" | "muted" }> = {
	offer: { label: "Offer out", tone: "active" },
	interviewing: { label: "Interviewing", tone: "info" },
	call: { label: "Call booked", tone: "neutral" },
	intro: { label: "Intro sent", tone: "muted" },
};

/** Everyone you said yes to and where they are now: what Clera delivered, not only what's left to do. */
export function HomeMovingForward({
	orgId,
	people,
	stuckReason,
	nextDrop,
}: {
	orgId: string;
	people: MovingForwardPerson[];
	/** Why an intro in this role can't be booked, or null when it can. */
	stuckReason: (roleId: string) => string | null;
	nextDrop: string;
}) {
	if (people.length === 0)
		return (
			<HomeCard title="Moving forward" note="This week">
				<Lede>Your first intro shows up here, all the way to the offer.</Lede>
				<p className="border-v2-border-divider border-t px-4 py-2.5 font-v2-body text-v2-text-tertiary text-xs max-lg:px-3">
					After your first drop on {nextDrop}
				</p>
			</HomeCard>
		);

	const intros = people.filter((p) => p.stage === "intro").length;
	const calls = people.filter((p) => p.stage === "call").length;
	// Someone stuck goes first, so the cap never hides a problem.
	const ordered = [...people].sort((a, b) => Number(!!stuckReason(b.roleId)) - Number(!!stuckReason(a.roleId)));
	return (
		<HomeCard title="Moving forward" note="This week">
			<p className="border-v2-border-divider border-t px-4 pt-3 pb-1 font-v2-body text-sm text-v2-text-secondary max-lg:px-3">
				We set up <b className="font-semibold text-v2-text-primary">{intros === 1 ? "1 intro" : `${intros} intros`}</b>{" "}
				· <b className="font-semibold text-v2-text-primary">{calls === 1 ? "1 call" : `${calls} calls`}</b> booked
			</p>
			{ordered.slice(0, SHOWN).map((p, i) => {
				const stuck = p.stage === "intro" ? stuckReason(p.roleId) : null;
				return (
					<div key={p.key} className={i === 0 ? "" : "border-v2-border-divider border-t"}>
						<Link
							href={orgRoutes.pipeline(orgId, p.roleId)}
							className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-v2-bg-warm max-lg:px-3"
						>
							<UserAvatar name={p.name} generated size="sm" />
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium font-v2-body text-sm text-v2-text-primary">{p.name}</p>
								<p className="truncate font-v2-body text-v2-text-tertiary text-xs">{p.roleName}</p>
							</div>
							<div className="flex shrink-0 flex-col items-end gap-1">
								<StatusPill tone={STAGE[p.stage].tone} size="xs">
									{STAGE[p.stage].label}
								</StatusPill>
								<When person={p} />
							</div>
						</Link>
						{stuck && (
							<p className="mx-4 mb-2.5 rounded-v2-md bg-v2-status-warning-bg px-2.5 py-1.5 font-v2-body text-v2-status-warning text-xs max-lg:mx-3">
								{stuck}
							</p>
						)}
					</div>
				);
			})}
			<div className="flex items-center justify-between gap-3 border-v2-border-divider border-t px-4 py-2.5 font-v2-body text-v2-text-tertiary text-xs max-lg:px-3">
				<span>
					{people.length > SHOWN ? `+${people.length - SHOWN} more moving forward` : "Everyone after the intro"}
				</span>
				<Link
					href={orgRoutes.pipeline(orgId)}
					className="-my-2 flex shrink-0 items-center gap-1 py-2 font-medium text-v2-text-brand hover:underline"
				>
					Open Pipeline <ArrowRight size={12} />
				</Link>
			</div>
		</HomeCard>
	);
}

HomeMovingForward.displayName = "HomeMovingForward";

/** "Thu 14:00" when something is coming up, else how long ago it happened (in the browser only: it reads the clock). */
function When({ person }: { person: MovingForwardPerson }) {
	const inBrowser = useSyncExternalStore(
		noop,
		() => true,
		() => false,
	);
	const ago = person.at && inBrowser ? formatTimeAgoCompact(person.at) : "";
	const text = person.next ?? (ago === "now" ? "just now" : ago ? `${ago} ago` : null);
	return text ? <span className="font-v2-body text-v2-text-tertiary text-xs tabular-nums">{text}</span> : null;
}

const noop = () => () => {};
