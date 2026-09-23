"use client";

import { cn } from "@v2/lib/utils";
import { STREAM_CONFIG } from "./stream-badge";
import type { ReviewStream } from "./types";

interface ReviewStreamFilterOptionProps {
	stream: ReviewStream;
	count: number;
	checked: boolean;
}

export function ReviewStreamFilterOption({ stream, count, checked }: ReviewStreamFilterOptionProps) {
	const { label, icon: Icon, iconClassName } = STREAM_CONFIG[stream];
	return (
		<>
			<Icon size={13} weight="fill" className={cn("shrink-0", iconClassName)} aria-hidden="true" />
			<span className={cn("flex-1 truncate text-v2-text-primary", checked && "font-medium")}>{label}</span>
			<span className="shrink-0 text-2xs tabular-nums text-v2-text-tertiary">{count}</span>
		</>
	);
}

ReviewStreamFilterOption.displayName = "ReviewStreamFilterOption";
