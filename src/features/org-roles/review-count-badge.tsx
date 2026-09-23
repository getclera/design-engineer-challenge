interface ReviewCountBadgeProps {
	count: number;
	truncated?: boolean;
}

export function ReviewCountBadge({ count, truncated }: ReviewCountBadgeProps) {
	return (
		<span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-v2-brand-green px-1 text-2xs font-semibold text-v2-text-inverse">
			{truncated ? `${count}+` : count}
		</span>
	);
}

ReviewCountBadge.displayName = "ReviewCountBadge";
