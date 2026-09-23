"use client";

import { CheckboxFilter, FilterPopover } from "@v2/components/filters";
import { ReviewStreamFilterOption } from "./review-stream-filter-option";
import { STREAM_CONFIG } from "./stream-badge";
import { REVIEW_STREAMS, type ReviewStream } from "./types";

interface ReviewStreamFilterProps {
	streams: ReviewStream[];
	counts: Record<ReviewStream, number>;
	onChange: (next: ReviewStream[]) => void;
}

export function ReviewStreamFilter({ streams, counts, onChange }: ReviewStreamFilterProps) {
	const filtered = streams.length < REVIEW_STREAMS.length;
	return (
		<FilterPopover
			label="Candidate type"
			isActive={filtered}
			activeFilterCount={filtered ? streams.length : 0}
			className="h-7 border-solid"
			contentClassName="w-60"
		>
			<CheckboxFilter
				options={REVIEW_STREAMS.map((s) => ({ value: s, label: STREAM_CONFIG[s].label, count: counts[s] }))}
				selected={streams}
				onChange={(next) => onChange(REVIEW_STREAMS.filter((s) => next.includes(s)))}
				searchable={false}
				selectedFirst={false}
				virtualize={false}
				renderOption={(opt, checked) => {
					const stream = REVIEW_STREAMS.find((s) => s === opt.value);
					if (!stream) return null;
					return <ReviewStreamFilterOption stream={stream} count={counts[stream]} checked={checked} />;
				}}
			/>
		</FilterPopover>
	);
}

ReviewStreamFilter.displayName = "ReviewStreamFilter";
