"use client";

import { useQueryClient } from "@tanstack/react-query";
import { prefetchOrgTalentProfile } from "@v2/features/org-talent-profile";
import { prefetchPrimaryResume } from "@v2/features/talent-profile";
import { useEffect } from "react";
import { type ReviewItem, reviewItemKey } from "../types";

const WINDOW_OFFSETS = [1, -1, 2];

export function usePrefetchNextProfile(orgId: string, items: ReviewItem[], selectedKey: string | null) {
	const queryClient = useQueryClient();
	const idx = items.findIndex((i) => reviewItemKey(i) === selectedKey);
	const windowIds = WINDOW_OFFSETS.map((offset) => (idx + offset >= 0 ? items[idx + offset]?.talentId : undefined))
		.filter((talentId): talentId is string => !!talentId)
		.join(",");

	useEffect(() => {
		if (!windowIds) return;
		let cancelled = false;
		(async () => {
			const ids = windowIds.split(",");
			for (const talentId of ids) {
				if (cancelled) return;
				await prefetchOrgTalentProfile(queryClient, orgId, talentId);
			}
			for (const talentId of ids) {
				if (cancelled) return;
				await prefetchPrimaryResume(queryClient, talentId, orgId);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [windowIds, queryClient, orgId]);
}
