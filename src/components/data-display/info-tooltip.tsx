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
						// A real button, so keyboard and screen-reader users reach the explanation too.
						<button
							type="button"
							aria-label={trigger ? undefined : "More about this"}
							className={cn(
								"focus-ring relative inline-flex cursor-help items-center rounded-full before:absolute before:-inset-2",
								trigger ? "underline decoration-dotted underline-offset-2" : "text-v2-text-muted",
							)}
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
						>
							{trigger ?? <Info size={11} weight="regular" aria-hidden="true" />}
						</button>
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
