"use client";

import { formatTimeAgo } from "@clera/shared-utils";
import { PencilSimple, Robot, User } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@v2/components/ui/popover";
import { Skeleton } from "@v2/components/ui/skeleton";
import { cn } from "@v2/lib/utils";
import { useState } from "react";
import { useYoeHistory } from "../../hooks/use-yoe-history";

interface YoeHistoryPopoverProps {
	talentId: string;
	yearsExperience: number;
	onEditClick: () => void;
}

function YoeHistoryPopover({ talentId, yearsExperience, onEditClick }: YoeHistoryPopoverProps) {
	const [open, setOpen] = useState(false);
	const { data, isLoading } = useYoeHistory(talentId, open);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label="View YOE history"
					className="size-auto border-0 bg-transparent p-0 shadow-none font-v2-body text-xs text-v2-text-muted hover:bg-transparent hover:text-v2-text-secondary"
				>
					{yearsExperience}y
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-80 p-0 overflow-hidden" tone="grey">
				<div className="flex items-center justify-between px-3 py-2.5 border-b border-v2-border-warm/50">
					<span className="font-v2-heading text-xs font-semibold text-v2-text-primary">Years of Experience</span>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							setOpen(false);
							onEditClick();
						}}
						className="size-6 border-0 bg-transparent p-0 shadow-none text-v2-text-muted hover:bg-v2-bg-input-solid hover:text-v2-text-primary"
						aria-label="Override manually"
					>
						<PencilSimple size={13} />
					</Button>
				</div>

				<div className="max-h-72 overflow-y-auto">
					{isLoading ? (
						<div className="flex flex-col gap-px p-3">
							<Skeleton className="h-10 w-full rounded-v2-sm" />
							<Skeleton className="h-10 w-full rounded-v2-sm" />
						</div>
					) : !data?.runs.length ? (
						<p className="px-3 py-4 font-v2-body text-xs text-v2-text-muted">
							No run history yet. History is recorded from now on.
						</p>
					) : (
						<ul className="flex flex-col divide-y divide-v2-border-warm/40">
							{data.runs.map((run) => (
								<li key={run.id} className="px-3 py-2.5">
									<div className="flex items-center justify-between gap-2 mb-0.5">
										<div className="flex items-center gap-1.5">
											{run.source === "manual_override" ? (
												<User size={11} className="shrink-0 text-v2-text-muted" />
											) : (
												<Robot size={11} className="shrink-0 text-v2-text-muted" />
											)}
											<span className="font-v2-heading text-xs font-semibold text-v2-text-primary">
												{run.yearsExperience}y
											</span>
											<span
												className={cn(
													"font-v2-body text-2xs px-1.5 py-0.5 rounded-full",
													run.source === "manual_override"
														? "bg-v2-bg-input-solid text-v2-text-secondary"
														: "bg-v2-brand-green/10 text-v2-text-brand-green",
												)}
											>
												{run.source === "manual_override" ? "manual" : "AI"}
											</span>
										</div>
										<span className="font-v2-body text-2xs text-v2-text-muted shrink-0">
											{formatTimeAgo(run.computedAt)}
										</span>
									</div>
									{run.reasoning && (
										<p className="font-v2-body text-2xs text-v2-text-secondary leading-relaxed line-clamp-3">
											{run.reasoning}
										</p>
									)}
								</li>
							))}
						</ul>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}

YoeHistoryPopover.displayName = "YoeHistoryPopover";

export { YoeHistoryPopover };
