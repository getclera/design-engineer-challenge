"use client";

import { LogoWithFallback } from "@v2/components/ui/logo-with-fallback";
import { StatusPill } from "@v2/components/ui/status-pill";
import { dateRangeLabel, durationLabel } from "../../utils";

interface TimelineRowProps {
	logoSrc: string | null;
	logoAlt: string;
	logoFallback: string;
	logoHref?: string | null;
	onLogoClick?: () => void;
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	startDate: string | null;
	endDate: string | null;
	dateFormat?: "month-year" | "year";
	duration?: string | null;
	durationTone?: "active" | "error" | "neutral" | "warning" | "info" | "muted";
	children?: React.ReactNode;
}

function TimelineRow({
	logoSrc,
	logoAlt,
	logoFallback,
	logoHref,
	onLogoClick,
	title,
	subtitle,
	startDate,
	endDate,
	dateFormat = "month-year",
	duration,
	durationTone,
	children,
}: TimelineRowProps) {
	const dateRange = dateRangeLabel(startDate, endDate, dateFormat);
	const durationText = duration ?? durationLabel(startDate, endDate);
	const isShort = durationText && !durationText.includes("y") && Number.parseInt(durationText, 10) < 6;
	const tone = durationTone ?? (isShort ? "error" : "active");

	return (
		<div className="flex gap-3 px-4 py-2.5 sm:px-5">
			<LogoWithFallback
				src={logoSrc}
				alt={logoAlt}
				fallbackInitial={logoFallback}
				href={onLogoClick ? undefined : logoHref}
				onClick={onLogoClick}
				sizeClassName="size-11"
				className="shrink-0"
			/>
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="flex items-start justify-between gap-2">
					<div className="flex min-w-0 flex-col">
						{title}
						{subtitle}
					</div>
					<div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
						{dateRange && (
							<span className="rounded-v2-full border border-v2-border-warm px-1.5 py-px font-v2-body text-2xs text-v2-text-muted">
								{dateRange}
							</span>
						)}
						{durationText && (
							<StatusPill tone={tone} size="xs">
								{durationText}
							</StatusPill>
						)}
					</div>
				</div>
				{children}
			</div>
		</div>
	);
}
TimelineRow.displayName = "TimelineRow";

export { TimelineRow };
