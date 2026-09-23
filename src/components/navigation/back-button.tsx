"use client";

import { Button } from "@v2/components/ui/button";
import { cn } from "@v2/lib/utils";

interface BackButtonProps {
	onClick: () => void;
	className?: string;
	label?: string;
}

function BackButton({ onClick, className, label = "Back" }: BackButtonProps) {
	return (
		<Button
			type="button"
			variant="unstyled"
			size="unstyled"
			onClick={onClick}
			className={cn(
				"flex items-center gap-1 font-v2-body text-sm font-light text-v2-text-secondary transition-colors hover:text-v2-text-primary",
				className,
			)}
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-current">
				<path
					d="M10 12L6 8L10 4"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
			{label}
		</Button>
	);
}
BackButton.displayName = "BackButton";

export { BackButton };
