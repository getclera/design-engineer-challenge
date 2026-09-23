"use client";

import { Tag } from "@v2/components/ui/tag";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@v2/components/ui/tooltip";

interface TagListProps {
	items: string[];
	maxVisible?: number;
	variant?: "display" | "filter" | "active";
	tagClassName?: string;
	className?: string;
	inlineOverflow?: boolean;
	formatItem?: (item: string) => string;
	itemTitle?: (item: string) => string;
}

function TagList({
	items,
	maxVisible = 1,
	variant = "filter",
	tagClassName = "text-xs",
	className,
	inlineOverflow = false,
	formatItem = (item) => item,
	itemTitle,
}: TagListProps) {
	if (items.length === 0) return null;

	const visible = items.slice(0, maxVisible);
	const remaining = items.slice(maxVisible);

	if (remaining.length === 0) {
		return (
			<div className={className}>
				{visible.map((item) => (
					<Tag key={item} variant={variant} className={tagClassName} title={itemTitle?.(item)}>
						{formatItem(item)}
					</Tag>
				))}
			</div>
		);
	}

	if (inlineOverflow) {
		const lastIndex = visible.length - 1;
		return (
			<TooltipProvider>
				<div className={className ?? "flex flex-wrap items-center gap-1.5"}>
					{visible.slice(0, lastIndex).map((item) => (
						<Tag key={item} variant={variant} className={tagClassName} title={itemTitle?.(item)}>
							{formatItem(item)}
						</Tag>
					))}
					<Tooltip delayDuration={200}>
						<TooltipTrigger asChild>
							<Tag variant={variant} className={tagClassName}>
								{`${formatItem(visible[lastIndex])} +${remaining.length}`}
							</Tag>
						</TooltipTrigger>
						<TooltipContent className="max-w-60" sideOffset={6}>
							{items.join(", ")}
						</TooltipContent>
					</Tooltip>
				</div>
			</TooltipProvider>
		);
	}

	return (
		<TooltipProvider>
			<div className={className ?? "flex flex-wrap items-center gap-1.5"}>
				{visible.map((item) => (
					<Tag key={item} variant={variant} className={tagClassName} title={itemTitle?.(item)}>
						{formatItem(item)}
					</Tag>
				))}
				<Tooltip delayDuration={200}>
					<TooltipTrigger asChild>
						<Tag variant={variant} className={tagClassName}>
							+{remaining.length}
						</Tag>
					</TooltipTrigger>
					<TooltipContent className="max-w-60" sideOffset={6}>
						{items.join(", ")}
					</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
}
TagList.displayName = "TagList";

export { TagList };
