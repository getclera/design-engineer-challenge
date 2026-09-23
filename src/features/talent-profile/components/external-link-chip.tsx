"use client";

import { ArrowSquareOut } from "@phosphor-icons/react";
import { cn } from "@v2/lib/utils";
import { ensureProtocol } from "../utils/external-links";

interface ExternalLinkChipProps {
	href: string;
	icon: React.ReactNode;
	label: string;
	variant?: "compact" | "contact";
	className?: string;
}

function ExternalLinkChip({ href, icon, label, variant = "compact", className }: ExternalLinkChipProps) {
	const url = ensureProtocol(href);
	const isContact = variant === "contact";
	return (
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				"inline-flex items-center gap-1 rounded-v2-md px-1.5 py-0.5 text-v2-text-secondary transition-colors hover:bg-v2-bg-input-solid",
				isContact ? "text-xs" : "font-v2-body text-2xs hover:text-v2-text-primary",
				className,
			)}
			title={url}
		>
			{icon}
			<span className={cn("truncate", isContact ? "hidden max-w-35 sm:inline" : "max-w-40")}>{label}</span>
			{isContact && <ArrowSquareOut size={10} className="text-v2-text-tertiary" />}
		</a>
	);
}
ExternalLinkChip.displayName = "ExternalLinkChip";

export { ExternalLinkChip };
