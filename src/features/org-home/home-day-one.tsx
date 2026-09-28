"use client";

import { CheckCircle, Lightning, PaperPlaneTilt, X } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Card } from "@v2/components/ui/card";
import { StatusPill } from "@v2/components/ui/status-pill";
import { TalentBoardCard } from "@v2/features/org-shared-cards";
import { cn } from "@v2/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { HomeCard } from "./home-card";
import { Lede } from "./home-next-steps";

export interface NextDrop {
	day: string;
	size: number;
	/** Assumed data: the challenge API doesn't expose the search. */
	looked: number;
	shortlisted: number;
}

/** Before the first drop: Clera is already working for you, and here's when it lands. */
export function HomeFirstDrop({ drop, roleName }: { drop: NextDrop; roleName: string }) {
	const reduced = useReducedMotion();
	return (
		<Card className="flex items-center gap-5 px-5 py-4.5 max-lg:gap-4 max-lg:px-4">
			<span
				aria-hidden="true"
				className="relative size-16 shrink-0 overflow-hidden rounded-full border border-v2-border-divider bg-v2-status-success-bg max-lg:size-12"
			>
				<span className="absolute inset-[28%] rounded-full bg-v2-bg-card" />
				<motion.span
					className="absolute inset-0 rounded-full"
					style={{ background: "conic-gradient(from 0deg, transparent 0 280deg, rgba(3,147,101,0.5) 360deg)" }}
					animate={reduced ? undefined : { rotate: 360 }}
					transition={{ duration: 2.8, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
				/>
			</span>
			<div className="min-w-0 flex-1">
				<p className="flex items-center gap-2 font-v2-body text-v2-text-tertiary text-xs">
					<motion.span
						className="size-1.5 rounded-full bg-v2-brand-green"
						animate={reduced ? undefined : { opacity: [1, 0.35, 1], scale: [1, 0.7, 1] }}
						transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
					/>
					<b className="font-medium text-v2-text-secondary">Searching for you</b>
				</p>
				<p className="mt-1 text-balance font-v2-heading text-v2-text-primary text-xl max-lg:text-lg">
					Your first candidates arrive {drop.day}
				</p>
				<p className="mt-0.5 font-v2-body text-sm text-v2-text-secondary">
					About {drop.size} people, hand-picked for {roleName}.
				</p>
				<p className="mt-2 font-v2-body text-v2-text-secondary text-xs tabular-nums">
					We've looked at <b className="font-semibold text-v2-text-primary">{drop.looked.toLocaleString("en")}</b>{" "}
					profiles · <b className="font-semibold text-v2-text-primary">{drop.shortlisted}</b> shortlisted so far
				</p>
			</div>
		</Card>
	);
}

HomeFirstDrop.displayName = "HomeFirstDrop";

export interface SetupStep {
	key: string;
	title: string;
	meta: string;
	action: string;
	done: boolean;
}

/** Day 1's Next moves: four steps with a finish line, so the wait feels like progress. */
export function HomeGetReady({ day, steps: initial }: { day: string; steps: SetupStep[] }) {
	const reduced = useReducedMotion();
	// Demo only: steps check off right here. The real pages (Settings, Integrations) aren't part of this challenge.
	const [done, setDone] = useState(() => new Set(initial.filter((s) => s.done).map((s) => s.key)));
	const [justDone, setJustDone] = useState<string | null>(null);
	const count = done.size;
	const all = count === initial.length;
	const next = initial.find((s) => !done.has(s.key));
	const C = 2 * Math.PI * 15;
	return (
		<HomeCard title={`Get ready for ${day}`} note={`${count} of ${initial.length} ready`}>
			<div className="flex items-center gap-3.5 border-v2-border-divider border-t px-4 py-3.5 max-lg:px-3">
				<svg viewBox="0 0 36 36" className="size-11 shrink-0 -rotate-90" aria-hidden="true">
					<circle cx="18" cy="18" r="15" fill="none" strokeWidth="3.5" className="stroke-v2-border-divider" />
					<motion.circle
						cx="18"
						cy="18"
						r="15"
						fill="none"
						strokeWidth="3.5"
						strokeLinecap="round"
						className="stroke-v2-brand-green"
						strokeDasharray={C}
						initial={false}
						animate={{ strokeDashoffset: C * (1 - count / initial.length) }}
						transition={reduced ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
					/>
				</svg>
				<div className="min-w-0 flex-1">
					<p className="font-medium font-v2-body text-[15px] text-v2-text-primary">
						{all
							? `You're ready for ${day}`
							: `${initial.length - count} ${initial.length - count === 1 ? "step" : "steps"} left`}
					</p>
					<p className="mt-0.5 font-v2-body text-v2-text-tertiary text-xs">
						{all
							? "Your first candidates can book a call and say yes fast."
							: "Finish these so your first candidates can say yes fast."}
					</p>
				</div>
			</div>
			{initial.map((step, i) => {
				const ok = done.has(step.key);
				const isNext = step === next;
				return (
					<div
						key={step.key}
						className={cn(
							"flex items-center gap-3 border-v2-border-divider border-t px-4 py-3 max-lg:px-3",
							isNext && "bg-gradient-to-r from-v2-status-success-bg to-transparent to-60%",
						)}
					>
						<span className="grid w-5 shrink-0 place-items-center font-v2-body text-v2-text-tertiary text-xs tabular-nums">
							{ok ? (
								<motion.span
									initial={justDone === step.key && !reduced ? { scale: 0.3, opacity: 0 } : false}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ type: "spring", stiffness: 500, damping: 15 }}
									className="grid text-v2-brand-green"
								>
									<CheckCircle size={18} weight="fill" />
								</motion.span>
							) : (
								i + 1
							)}
						</span>
						<div className="min-w-0 flex-1">
							<p
								className={cn(
									"font-v2-body text-sm",
									ok ? "text-v2-text-tertiary" : "font-medium text-v2-text-primary",
								)}
							>
								{step.title}
							</p>
							<p className="mt-0.5 font-v2-body text-v2-text-tertiary text-xs">{ok ? "Done" : step.meta}</p>
						</div>
						{!ok && (
							<Button
								variant={isNext ? "primary" : "ghost"}
								size={isNext ? "sm" : "compact"}
								onClick={() => {
									setDone((d) => new Set(d).add(step.key));
									setJustDone(step.key);
									if (count + 1 === initial.length) toast.success(`You're ready for ${day}.`);
								}}
							>
								{step.action}
							</Button>
						)}
					</div>
				);
			})}
		</HomeCard>
	);
}

HomeGetReady.displayName = "HomeGetReady";

/** What a candidate will look like, clearly marked as an example, so day 1 already teaches the page. */
export function HomeExampleCandidate({ day }: { day: string }) {
	const note = () => toast(`Just an example. Your real candidates arrive ${day}.`);
	return (
		<HomeCard
			title={`What ${day} looks like`}
			note={
				<StatusPill tone="info" size="xs">
					Example
				</StatusPill>
			}
		>
			<div className="border-v2-border-divider border-t bg-[repeating-linear-gradient(135deg,transparent_0_10px,var(--color-v2-bg-warm)_10px_20px)]">
				<TalentBoardCard
					item={{
						name: "Hannah Weiss",
						avatarUrl: null,
						subtitle: "Backend engineer who scaled payments at a Series B",
						companies: [],
						school: null,
					}}
					isSelected={false}
					onSelect={note}
					onPrefetch={() => {}}
					badge={<span className="ml-auto font-v2-body text-2xs text-v2-text-tertiary">just now</span>}
					footer={
						<p className="flex items-center gap-1.5 font-v2-body text-v2-text-brand text-xs">
							<Lightning size={12} className="shrink-0" />
							Built the ledger you'd be building, twice
						</p>
					}
				/>
				{/* Outside the card: it's a button itself, and buttons can't nest. */}
				<div className="flex gap-2 pr-4 pb-3 pl-16 max-lg:pl-15">
					<Button variant="ghost" size="compact" className="gap-1.5" onClick={note}>
						<X size={12} /> Pass
					</Button>
					<Button variant="ghost" size="compact" className="gap-1.5" onClick={note}>
						<PaperPlaneTilt size={12} /> Request intro
					</Button>
				</div>
			</div>
			<Lede>This is how people will show up. Your reasons teach us who to send next.</Lede>
		</HomeCard>
	);
}

HomeExampleCandidate.displayName = "HomeExampleCandidate";
