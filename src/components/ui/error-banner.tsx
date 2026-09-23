"use client";

import { Button } from "@v2/components/ui/button";
import type { ReactNode } from "react";

type BannerTone = "error" | "warning" | "info" | "neutral" | "active";

interface ErrorBannerAction {
	label: string;
	onClick: () => void;
	disabled?: boolean;
}

interface ErrorBannerProps {
	children: ReactNode;
	action?: ErrorBannerAction;
	className?: string;
	tone?: BannerTone;
	icon?: ReactNode;
}

const TONE_CLASSES: Record<BannerTone, string> = {
	error: "border-v2-status-error/20 bg-v2-status-error/5 text-v2-status-error",
	warning: "border-v2-status-warning/20 bg-v2-status-warning/5 text-v2-status-warning",
	info: "border-v2-status-info/20 bg-v2-status-info/5 text-v2-status-info",
	neutral: "border-v2-status-neutral/20 bg-v2-status-neutral/5 text-v2-status-neutral",
	active: "border-v2-brand-green/20 bg-v2-status-active-bg text-v2-text-brand-green",
};

function ErrorBanner({ children, action, className, tone = "error", icon }: ErrorBannerProps) {
	const toneClass = `rounded-v2-md border px-4 py-3 font-v2-body text-sm ${TONE_CLASSES[tone]}${
		className ? ` ${className}` : ""
	}`;

	if (icon) {
		return (
			<div role="alert" className={`flex items-center gap-3 ${toneClass}`}>
				{icon}
				<span className="flex-1">{children}</span>
				{action && (
					<Button type="button" variant="ghost" size="sm" onClick={action.onClick} disabled={action.disabled}>
						{action.label}
					</Button>
				)}
			</div>
		);
	}

	return (
		<div role="alert" className={`text-center ${toneClass}`}>
			<p>{children}</p>
			{action && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="mt-2"
					onClick={action.onClick}
					disabled={action.disabled}
				>
					{action.label}
				</Button>
			)}
		</div>
	);
}
ErrorBanner.displayName = "ErrorBanner";

export type { BannerTone };
export { ErrorBanner };
