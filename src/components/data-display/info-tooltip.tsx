"use client";

import { Info } from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@v2/components/ui/tooltip";
import { cn } from "@v2/lib/utils";
import type { ReactNode } from "react";

interface InfoTooltipProps {
	children: ReactNode;
	side?: "top" | "right" | "bottom" | "left";
	contentClassName?: string;
	trigger?: ReactNode;
}

function InfoTooltip({ children, side = "top", contentClassName, trigger }: InfoTooltipProps) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					{
						// biome-ignore lint/a11y/noStaticElementInteractions: stopPropagation prevents tooltip click from toggling clickable ancestors
						<span
							className={cn(
								"inline-flex cursor-help items-center",
								trigger ? "underline decoration-dotted underline-offset-2" : "text-v2-text-muted",
							)}
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
							role="presentation"
						>
							{trigger ?? <Info size={11} weight="regular" aria-hidden="true" />}
						</span>
					}
				</TooltipTrigger>
				<TooltipContent side={side} className={cn("max-w-60 text-xs", contentClassName)}>
					{children}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
InfoTooltip.displayName = "InfoTooltip";

export { InfoTooltip, type InfoTooltipProps };
