"use client";

import { formatDateTime } from "@clera/shared-utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@v2/components/ui/select";
import { useCallback } from "react";
import type { SendoutListEntry } from "@/services/api/organizations";

const ALL_CANDIDATES = "all";

function sendoutLabel(drop: SendoutListEntry, feedTalentIds: ReadonlySet<string>): string {
	const date = formatDateTime(drop.sentAt, { style: "short-date", fallback: "Undated" });
	const left = drop.talentIds.filter((talentId) => feedTalentIds.has(talentId)).length;
	return `Sent ${date} · ${left === 0 ? "all reviewed" : `${left} left`}`;
}

interface SendoutListSwitcherProps {
	drops: SendoutListEntry[];
	activeNanoId?: string;
	feedTalentIds: ReadonlySet<string>;
	onSelect: (drop: SendoutListEntry) => void;
	onClear: () => void;
}

export function SendoutListSwitcher({
	drops,
	activeNanoId,
	feedTalentIds,
	onSelect,
	onClear,
}: SendoutListSwitcherProps) {
	const activeIsListed = activeNanoId !== undefined && drops.some((drop) => drop.nanoId === activeNanoId);

	const handleChange = useCallback(
		(value: string) => {
			if (value === ALL_CANDIDATES) {
				onClear();
				return;
			}
			const drop = drops.find((entry) => entry.nanoId === value);
			if (drop) onSelect(drop);
		},
		[drops, onClear, onSelect],
	);

	return (
		<Select value={activeNanoId ?? ALL_CANDIDATES} onValueChange={handleChange}>
			<SelectTrigger
				size="compact"
				className={`h-7 w-auto bg-transparent ${
					activeNanoId
						? "border border-v2-border-warm bg-v2-bg-input-solid text-v2-text-brand"
						: "border border-v2-border-default"
				}`}
			>
				<SelectValue className="whitespace-nowrap" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={ALL_CANDIDATES} size="compact" hideIndicator>
					All candidates
				</SelectItem>
				{activeNanoId !== undefined && !activeIsListed && (
					<SelectItem value={activeNanoId} size="compact" hideIndicator>
						The list we sent you
					</SelectItem>
				)}
				{drops.map((drop) => (
					<SelectItem key={drop.nanoId} value={drop.nanoId} size="compact" hideIndicator>
						{sendoutLabel(drop, feedTalentIds)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

SendoutListSwitcher.displayName = "SendoutListSwitcher";
