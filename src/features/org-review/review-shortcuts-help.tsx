"use client";

import { X } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Kbd } from "@v2/components/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@v2/components/ui/popover";
import { useEffect, useState } from "react";

const TIP_SEEN_KEY = "clera-review-keys-tip-seen";

const GROUPS: [string, [string[], string][]][] = [
	[
		"Decide",
		[
			[["→", "↵"], "Request intro"],
			[["←", "⌫"], "Pass"],
			[["M"], "Maybe"],
		],
	],
	[
		"After deciding",
		[
			[["↑", "↓"], "Choose a reason"],
			[["1–9"], "Pick a reason directly"],
			[["↵"], "Confirm"],
			[["Esc"], "Back a step or cancel"],
		],
	],
	[
		"Move around",
		[
			[["↑", "↓"], "Previous / next person"],
			[["Space"], "Full profile"],
			[["L"], "Show / hide list"],
			[["?"], "These shortcuts"],
		],
	],
];

interface ReviewShortcutsHelpProps {
	open: boolean;
	/** Viewers only get the "Move around" keys. */
	canDecide: boolean;
	onOpenChange: (open: boolean) => void;
}

/** Round "?" in the deck's corner: all keyboard shortcuts, plus a one-time tip that they exist. */
export function ReviewShortcutsHelp({ open, onOpenChange, canDecide }: ReviewShortcutsHelpProps) {
	const [showTip, setShowTip] = useState(false);
	useEffect(() => {
		try {
			setShowTip(localStorage.getItem(TIP_SEEN_KEY) !== "1");
		} catch {}
	}, []);
	const dismissTip = () => {
		setShowTip(false);
		try {
			localStorage.setItem(TIP_SEEN_KEY, "1");
		} catch {}
	};
	// Opening the shortcuts (button or "?") means the tip did its job.
	useEffect(() => {
		if (open) dismissTip();
	}, [open]);

	return (
		<div className="flex items-center gap-2">
			{showTip && !open && (
				<div role="status" className="flex items-center gap-2 rounded-v2-full bg-v2-bg-card py-1 pr-1.5 pl-3 font-v2-body text-v2-text-secondary text-xs shadow-v2-content">
					Tip: press <Kbd>?</Kbd> for all shortcuts
					<Button variant="unstyled" size="unstyled" aria-label="Dismiss tip" onClick={dismissTip} className="focus-ring rounded-v2-full p-1">
						<X size={12} />
					</Button>
				</div>
			)}
			<Popover
				open={open}
				onOpenChange={onOpenChange}
			>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						aria-label="Keyboard shortcuts"
						className="size-9 min-w-9 rounded-v2-full bg-v2-bg-card font-semibold shadow-v2-content"
					>
						?
					</Button>
				</PopoverTrigger>
				<PopoverContent side="top" align="end" sideOffset={8} className="w-72">
					<div className="flex items-center justify-between pb-1">
						<p className="font-v2-heading font-medium text-sm text-v2-text-primary">Keyboard shortcuts</p>
						<Kbd>Esc</Kbd>
					</div>
					{GROUPS.slice(canDecide ? 0 : 2).map(([group, rows]) => (
						<section key={group} className="pt-3">
							<h3 className="pb-1 font-v2-body font-medium text-2xs text-v2-text-muted uppercase tracking-wider">
								{group}
							</h3>
							<dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5">
								{rows.map(([keys, label]) => (
									<div key={label} className="contents">
										<dt className="flex gap-1">
											{keys.map((key) => (
												<Kbd key={key} className="bg-v2-bg-card">
													{key}
												</Kbd>
											))}
										</dt>
										<dd className="font-v2-body text-sm text-v2-text-body">{label}</dd>
									</div>
								))}
							</dl>
						</section>
					))}
				</PopoverContent>
			</Popover>
		</div>
	);
}
