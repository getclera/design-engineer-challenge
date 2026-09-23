"use client";

import { orgRoutes } from "@clera/route-factory";
import Link from "next/link";
import type { ReviewItem } from "./types";

interface ReviewHeaderMetaProps {
	item: ReviewItem;
	orgId: string;
	showRole: boolean;
}

export function ReviewHeaderMeta({ item, orgId, showRole }: ReviewHeaderMetaProps) {
	const roleName = showRole ? item.roleName : null;
	if (!roleName) return null;

	if (!item.roleId) {
		return (
			<span className="max-w-full truncate font-v2-body text-xs font-medium text-v2-text-secondary">{roleName}</span>
		);
	}

	return (
		<Link
			href={orgRoutes.roles.edit(orgId, item.roleId)}
			title={roleName}
			className="max-w-full truncate font-v2-body text-xs font-medium text-v2-text-brand transition-colors hover:underline"
		>
			{roleName}
		</Link>
	);
}

ReviewHeaderMeta.displayName = "ReviewHeaderMeta";
