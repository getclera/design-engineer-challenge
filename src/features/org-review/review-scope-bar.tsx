"use client";

import type { SendoutListEntry } from "@/services/api/organizations";
import { SendoutListSwitcher } from "./sendout-list-switcher";

interface ReviewScopeBarProps {
	drops: SendoutListEntry[];
	activeNanoId?: string;
	feedTalentIds: ReadonlySet<string>;
	onSelect: (drop: SendoutListEntry) => void;
	onClear: () => void;
	className?: string;
}

export function ReviewScopeBar({
	drops,
	activeNanoId,
	feedTalentIds,
	onSelect,
	onClear,
	className,
}: ReviewScopeBarProps) {
	return (
		<div className={`flex items-center gap-2 bg-v2-bg-input-solid/60 px-4 py-2 ${className ?? ""}`}>
			<span className="font-v2-body text-xs text-v2-text-tertiary">Showing</span>
			<SendoutListSwitcher
				drops={drops}
				activeNanoId={activeNanoId}
				feedTalentIds={feedTalentIds}
				onSelect={onSelect}
				onClear={onClear}
			/>
		</div>
	);
}

ReviewScopeBar.displayName = "ReviewScopeBar";
