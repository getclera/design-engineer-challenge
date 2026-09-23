"use client";

import { CaretDown, CaretRight } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { type MouseEvent, useCallback, useState } from "react";
import { isRepeatClick } from "@/utils/mouse";
import { dateRangeLabel, durationLabel } from "../../utils";
import { ExperienceDetailsBody } from "./experience-details-body";

interface ExperienceRoleLineProps {
	title: string | null;
	startDate: string | null;
	endDate: string | null;
	isLatest: boolean;
	description: string | null;
	resumeBullets: string[];
}

const TITLE_TEXT = "min-w-0 truncate font-v2-body text-2xs font-medium text-v2-text-primary";

function ExperienceRoleLine({
	title,
	startDate,
	endDate,
	isLatest,
	description,
	resumeBullets,
}: ExperienceRoleLineProps) {
	const [detailsOpen, setDetailsOpen] = useState(false);
	const range = dateRangeLabel(startDate, endDate, "month-year");
	const duration = durationLabel(startDate, endDate);
	const hasDetails = Boolean(description) || resumeBullets.length > 0;
	const CaretIcon = detailsOpen ? CaretDown : CaretRight;
	const toggleDetails = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		if (isRepeatClick(event)) return;
		setDetailsOpen((v) => !v);
	}, []);

	return (
		<li className="relative flex flex-col gap-0.5 pl-4">
			<span
				className={`absolute left-0 top-1.5 size-1.5 rounded-v2-full ${isLatest ? "bg-v2-text-brand-green" : "bg-v2-text-muted"}`}
				aria-hidden="true"
			/>
			<div className="flex items-baseline justify-between gap-2">
				{hasDetails ? (
					<Button
						variant="ghost"
						size="sm"
						onClick={toggleDetails}
						className="h-auto w-fit min-w-0 justify-start gap-1 border-0 bg-transparent p-0 text-left shadow-none hover:bg-transparent"
						aria-expanded={detailsOpen}
						aria-label={detailsOpen ? `Hide details for ${title}` : `Show details for ${title}`}
					>
						<CaretIcon size={10} className="shrink-0 text-v2-text-muted" />
						<span className={TITLE_TEXT}>{title}</span>
					</Button>
				) : (
					<span className={TITLE_TEXT}>{title}</span>
				)}
				<span className="shrink-0 font-v2-body text-2xs text-v2-text-muted">
					{range}
					{duration && ` · ${duration}`}
				</span>
			</div>
			{detailsOpen && (
				<div className="pl-3.5">
					<ExperienceDetailsBody description={description} resumeBullets={resumeBullets} />
				</div>
			)}
		</li>
	);
}
ExperienceRoleLine.displayName = "ExperienceRoleLine";

export { ExperienceRoleLine };
