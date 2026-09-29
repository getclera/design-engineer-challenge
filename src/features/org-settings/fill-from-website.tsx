"use client";

import { Globe, Sparkle } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Card } from "@v2/components/ui/card";
import { looksLikeUrl } from "./company-profile";

const domain = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export function FromWebsite({ onUndo }: { onUndo: () => void }) {
	return (
		<span className="inline-flex items-center gap-1 text-2xs text-v2-text-brand-green">
			<Sparkle size={11} weight="fill" /> From your website ·
			<button
				type="button"
				onClick={onUndo}
				className="font-medium text-v2-text-brand underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal"
			>
				Undo
			</button>
		</span>
	);
}

export function FillFromWebsite({ website, busy, onFill }: { website: string; busy: boolean; onFill: () => void }) {
	const site = looksLikeUrl(website) ? domain(website) : null;
	return (
		<Card className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 px-4 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
			<span className="grid size-8 place-items-center rounded-v2-md bg-v2-status-success-bg text-v2-text-brand-green">
				{busy ? <Sparkle size={16} className="animate-spin motion-reduce:animate-none" /> : <Globe size={16} />}
			</span>
			<div className="min-w-0">
				<p className="font-medium font-v2-body text-sm text-v2-text-primary">
					{busy ? `Reading ${site}…` : "Fill from your website"}
				</p>
				<p className="font-v2-body text-v2-text-tertiary text-xs">
					{site
						? `We fill the empty fields from ${site}. We never change what you wrote.`
						: "Add your website under Links first."}
				</p>
			</div>
			<Button variant="ghost" size="sm" onClick={onFill} disabled={busy || !site} className="gap-1.5 max-sm:col-span-2">
				<Sparkle size={14} /> Fill empty fields
			</Button>
		</Card>
	);
}
