"use client";

import { TitledTooltip, type TitledTooltipProps } from "@v2/components/ui/titled-tooltip";

type ToolbarTooltipProps = TitledTooltipProps;

function ToolbarTooltip(props: ToolbarTooltipProps) {
	return <TitledTooltip {...props} />;
}

ToolbarTooltip.displayName = "ToolbarTooltip";

export { ToolbarTooltip, type ToolbarTooltipProps };
