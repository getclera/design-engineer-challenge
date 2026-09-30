"use client";

import { orgRoutes } from "@clera/route-factory";
import { StatusPill } from "@v2/components/ui/status-pill";
import Link from "next/link";
import type { ReviewItem } from "./types";
import { ReviewWaiting } from "./review-waiting";

interface ReviewHeaderMetaProps {
	item: ReviewItem;
	orgId: string;
	showRole: boolean;
}

/** Above the card: the role (in All roles, or "No role yet") and how long they've waited, as in the list rows. */
export function ReviewHeaderMeta({ item, orgId, showRole }: ReviewHeaderMetaProps) {
	const roleName = showRole ? item.roleName : null;
	if (!roleName && item.roleId && !item.receivedAt) return null;

	return (
		<>
			{!item.roleId ? (
				<StatusPill tone="warning" size="xs">
					No role yet
				</StatusPill>
			) : (
				roleName && (
					<Link
						href={orgRoutes.roles.edit(orgId, item.roleId)}
						title={roleName}
						className="max-w-full truncate font-v2-body text-xs font-medium text-v2-text-brand transition-colors hover:underline"
					>
						{roleName}
					</Link>
				)
			)}
			<ReviewWaiting item={item} />
		</>
	);
}

ReviewHeaderMeta.displayName = "ReviewHeaderMeta";
