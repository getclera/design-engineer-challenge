"use client";

import { orgRoutes } from "@clera/route-factory";
import { CheckCircleIcon, PauseCircleIcon } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { CleraLogo } from "@v2/components/ui/clera-logo";
import { Skeleton } from "@v2/components/ui/skeleton";
import { ReviewCountBadge } from "@v2/features/org-roles";
import type { ReviewListData } from "@v2/lib/review-feed";
import Link from "next/link";
import { useReviewEmptyScenario } from "./hooks/use-review-empty-scenario";
import { ReviewEmptyRow } from "./review-empty-row";

interface ReviewEmptyProps {
	orgId: string;
	roleId?: string;
	roleFeedCount: number;
	hasActiveSendout: boolean;
	canUseTalentSearch: boolean;
	byRole: ReviewListData["byRole"];
	pausedPending: ReviewListData["pausedPending"];
	onClearSendout: () => void;
	onRoleChange: (roleId: string) => void;
}

export function ReviewEmpty({
	orgId,
	roleId,
	roleFeedCount,
	hasActiveSendout,
	canUseTalentSearch,
	byRole,
	pausedPending,
	onClearSendout,
	onRoleChange,
}: ReviewEmptyProps) {
	const { scenario, otherRoles, roleName, rolePending, isResolved } = useReviewEmptyScenario(
		orgId,
		roleId,
		hasActiveSendout,
		roleFeedCount,
		byRole,
		pausedPending,
	);

	if (!isResolved) {
		return (
			<div className="flex flex-col items-center gap-3 px-6 py-14">
				<Skeleton className="h-6 w-56" />
				<Skeleton className="h-4 w-72" />
				<Skeleton className="mt-3 h-12 w-full max-w-md" />
			</div>
		);
	}

	if (scenario === "role-paused") {
		return (
			<div className="flex flex-col items-center px-6 py-12 text-center">
				<PauseCircleIcon size={28} weight="light" className="mb-4 text-v2-status-info" />
				<h3 className="font-v2-heading text-v2-text-primary text-lg">{roleName ?? "This role"} is paused</h3>
				<p className="mt-2 max-w-md font-v2-body text-sm text-v2-text-secondary">
					{rolePending > 0
						? `Activate it to review ${rolePending === 1 ? "the candidate" : `${rolePending} candidates`} waiting on it.`
						: "Activate it to start receiving candidates for review again."}
				</p>
				<Button asChild variant="primary" size="sm" className="mt-6">
					<Link href={orgRoutes.roles.list(orgId)}>Go to roles</Link>
				</Button>
			</div>
		);
	}

	if (scenario === "all-done") {
		return (
			<div className="flex flex-col items-center px-6 py-14 text-center">
				<CleraLogo className="mb-7 h-auto w-40 text-v2-brand-teal opacity-15" />
				<h3 className="font-v2-heading text-v2-text-primary text-xl">Nice, you're all done</h3>
				<p className="mt-2 max-w-md font-v2-body text-sm text-v2-text-secondary">
					Every candidate has a decision. New drops and intro requests land here.
				</p>
				<div className="mt-7 w-full max-w-md divide-y divide-v2-border-divider overflow-hidden rounded-v2-md border border-v2-border-warm">
					<ReviewEmptyRow label="See candidates you requested" href={orgRoutes.pipeline(orgId)} />
					{canUseTalentSearch && <ReviewEmptyRow label="Search talent yourself" href={orgRoutes.talentSearch(orgId)} />}
				</div>
			</div>
		);
	}

	const isListDone = scenario === "list-done";

	return (
		<div className="flex flex-col items-center px-6 py-12 text-center">
			<CheckCircleIcon size={28} weight="light" className="mb-4 text-v2-brand-green" />
			<h3 className="font-v2-heading text-v2-text-primary text-lg">
				{isListDone ? "That list is done" : `Nothing left in ${roleName ?? "this role"}`}
			</h3>
			<p className="mt-2 max-w-md font-v2-body text-sm text-v2-text-secondary">
				{isListDone ? "Keep going with the rest of this role." : "Other roles still have candidates waiting."}
			</p>
			<div className="mt-6 w-full max-w-md divide-y divide-v2-border-divider overflow-hidden rounded-v2-md border border-v2-border-warm">
				{isListDone ? (
					<ReviewEmptyRow
						label={roleName ?? "All candidates"}
						meta={<ReviewCountBadge count={roleFeedCount} />}
						onClick={onClearSendout}
					/>
				) : (
					otherRoles
						.slice(0, 4)
						.map((role) => (
							<ReviewEmptyRow
								key={role.id}
								label={role.position}
								meta={<ReviewCountBadge count={role.pending} />}
								onClick={() => onRoleChange(role.id)}
							/>
						))
				)}
			</div>
		</div>
	);
}

ReviewEmpty.displayName = "ReviewEmpty";
