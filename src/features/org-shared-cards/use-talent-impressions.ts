"use client";

import { useCallback, useEffect, useRef } from "react";
import { orgTalents } from "@/services/api/org-talents";

const DEBOUNCE_MS = 2_000;
const MAX_BATCH_SIZE = 50;

type ImpressionSource = "review" | "talent_search";

export function useTalentImpressions(
	orgId: string,
	source: ImpressionSource,
	appliedFilters: Record<string, unknown> | null,
) {
	const pending = useRef(new Set<string>());
	const reported = useRef(new Set<string>());
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const filtersRef = useRef(appliedFilters);
	filtersRef.current = appliedFilters;
	const pendingFilters = useRef(appliedFilters);

	const flush = useCallback(() => {
		if (pending.current.size === 0) return;
		const talentIds = [...pending.current].slice(0, MAX_BATCH_SIZE);
		for (const talentId of talentIds) pending.current.delete(talentId);
		orgTalents
			.recordTalentImpressions(orgId, { talentIds, source, appliedFilters: pendingFilters.current })
			.catch(() => {});
	}, [orgId, source]);

	useEffect(() => {
		const flushOnHide = () => {
			if (document.visibilityState === "hidden") flush();
		};
		document.addEventListener("visibilitychange", flushOnHide);
		window.addEventListener("pagehide", flush);
		return () => {
			document.removeEventListener("visibilitychange", flushOnHide);
			window.removeEventListener("pagehide", flush);
			if (timer.current) clearTimeout(timer.current);
			flush();
		};
	}, [flush]);

	return useCallback(
		(talentId: string) => {
			if (reported.current.has(talentId)) return;
			reported.current.add(talentId);
			if (pendingFilters.current !== filtersRef.current) {
				flush();
				pendingFilters.current = filtersRef.current;
			}
			pending.current.add(talentId);
			if (timer.current) clearTimeout(timer.current);
			timer.current = setTimeout(flush, DEBOUNCE_MS);
		},
		[flush],
	);
}
