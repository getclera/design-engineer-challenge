"use client";

import { useQueries } from "@tanstack/react-query";
import type { TalentEntityChip } from "@v2/components/data-display";
import { useCallback, useMemo, useRef, useState } from "react";
import { orgDashboardKeys } from "@/lib/query-keys";
import { organizations } from "@/services/api";

const CHIP_BATCH_SIZE = 25;

export interface EntityChipsState {
	companies: TalentEntityChip[];
	school: TalentEntityChip | null;
	isLoading: boolean;
}

const EMPTY: EntityChipsState = { companies: [], school: null, isLoading: true };
const SETTLED_EMPTY: EntityChipsState = { companies: [], school: null, isLoading: false };

export function registerTalentIds(order: string[], seen: Set<string>, talentIds: readonly string[]) {
	for (const talentId of talentIds) {
		if (seen.has(talentId)) continue;
		seen.add(talentId);
		order.push(talentId);
	}
}

export function chipBatches(order: readonly string[]): string[][] {
	const out: string[][] = [];
	for (let i = 0; i < order.length; i += CHIP_BATCH_SIZE) out.push(order.slice(i, i + CHIP_BATCH_SIZE));
	return out;
}

export function useDeferredEntityChips(orgId: string, talentIds: readonly string[]) {
	const [batchCount, setBatchCount] = useState(1);

	const orderRef = useRef<string[]>([]);
	const seenRef = useRef<Set<string>>(new Set());
	registerTalentIds(orderRef.current, seenRef.current, talentIds);
	const orderCount = orderRef.current.length;

	// biome-ignore lint/correctness/useExhaustiveDependencies: orderCount is the ref's change signal
	const batches = useMemo(() => chipBatches(orderRef.current), [orderCount]);

	const batchIndexByTalentId = useMemo(() => {
		const map = new Map<string, number>();
		batches.forEach((ids, index) => {
			for (const id of ids) map.set(id, index);
		});
		return map;
	}, [batches]);

	const activeBatches = batches.slice(0, batchCount);

	const results = useQueries({
		queries: activeBatches.map((batchIds) => ({
			queryKey: orgDashboardKeys.talentChips(orgId, batchIds),
			queryFn: async () => {
				const result = await organizations.getTalentChips(orgId, batchIds);
				if (!result.ok) throw new Error("Failed to load candidate chips");
				return result.data.chips;
			},
			staleTime: Number.POSITIVE_INFINITY,
			enabled: !!orgId && batchIds.length > 0,
		})),
	});

	const stateByTalentId = new Map<string, EntityChipsState>();
	results.forEach((batch, index) => {
		if (batch.isError) {
			for (const talentId of activeBatches[index] ?? []) stateByTalentId.set(talentId, SETTLED_EMPTY);
			return;
		}
		for (const chips of batch.data ?? []) {
			stateByTalentId.set(chips.talentId, { companies: chips.companies, school: chips.school, isLoading: false });
		}
	});

	const onCardVisible = useCallback(
		(talentId: string) => {
			const index = batchIndexByTalentId.get(talentId);
			if (index === undefined) return;
			setBatchCount((prev) => Math.max(prev, Math.min(index + 2, batches.length)));
		},
		[batchIndexByTalentId, batches.length],
	);

	const chipsFor = (talentId: string): EntityChipsState => stateByTalentId.get(talentId) ?? EMPTY;

	return { chipsFor, onCardVisible };
}
