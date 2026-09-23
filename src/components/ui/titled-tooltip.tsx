"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@v2/components/ui/tooltip";
import { cn } from "@v2/lib/utils";
import type { ReactNode } from "react";

interface TitledTooltipProps {
	name: string;
	description: string;
	extra?: ReactNode;
	align?: "start" | "center" | "end";
	className?: string;
	children: ReactNode;
}

function TitledTooltip({ name, description, extra, align, className, children }: TitledTooltipProps) {
	return (
		<TooltipProvider delayDuration={250} disableHoverableContent>
			<Tooltip>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent side="bottom" align={align} className={cn("max-w-60 px-2.5 py-1.5", className)}>
					<p className="text-xs font-medium">{name}</p>
					<p className="text-xs opacity-80">{description}</p>
					{extra}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

TitledTooltip.displayName = "TitledTooltip";

export { TitledTooltip, type TitledTooltipProps };
