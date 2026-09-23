"use client";

import { cn } from "@v2/lib/utils";

interface ContactsActionBadgeProps {
	count: number;
	className?: string;
}

function ContactsActionBadge({ count, className }: ContactsActionBadgeProps) {
	if (count <= 0) return null;

	return (
		<output
			aria-label={`${count} contact setting needs attention`}
			className={cn(
				"flex h-5 min-w-5 items-center justify-center rounded-full bg-v2-status-warning/15 px-1.5 font-v2-body text-xs font-medium tabular-nums text-v2-status-warning",
				className,
			)}
		>
			{count}
		</output>
	);
}

ContactsActionBadge.displayName = "ContactsActionBadge";

export { ContactsActionBadge };
