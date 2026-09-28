"use client";

import { orgRoutes } from "@clera/route-factory";
import {
	ArrowRight,
	ArrowUpRight,
	Briefcase,
	Buildings,
	CalendarCheck,
	CalendarPlus,
	CheckCircle,
	type Icon,
	Lightning,
	PlugsConnected,
	Tray,
	UserPlus,
} from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@v2/components/ui/button";
import { UserAvatar } from "@v2/components/ui/avatar";
import { Input } from "@v2/components/ui/input";
import { Kbd } from "@v2/components/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@v2/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@v2/components/ui/sheet";
import { invalidateOrgDashboard, PHONE_SHEET_CLASSES, SheetGrabber } from "@v2/features/org-review";
import { useMediaQuery } from "@v2/hooks/use-media-query";
import { cn } from "@v2/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, Fragment, type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { companyKeys, roleKeys } from "@/lib/query-keys";
import { companyContacts, organizations } from "@/services/api";
import { HomeCard } from "./home-card";
import { type NextStep, reviewMinutes, STEP_GROUP } from "./home-summary";

type Tone = "warning" | "info" | "ok" | "neutral";

export const TONE_CLASSES: Record<Tone, string> = {
	warning: "bg-v2-status-warning-bg text-v2-status-warning",
	info: "bg-v2-status-info-bg text-v2-status-info",
	ok: "bg-v2-status-success-bg text-v2-text-brand-green",
	neutral: "bg-v2-status-neutral-bg text-v2-text-secondary",
};

const GROUP_LABEL = { 1: "Needs a fix", 2: "Waiting on you", 3: "When you have a minute" } as const;
const SHOWN = 3;

const firstName = (name: string) => name.split(" ")[0] || name;
const candidates = (n: number) => `${n} ${n === 1 ? "candidate" : "candidates"}`;
const withView = (href: string, view: string) => `${href}${href.includes("?") ? "&" : "?"}view=${view}`;

/** The calm top of Next moves once nothing needs a fix and nobody waits on you. */
export interface CaughtUpWeek {
	/** Nobody new arrived this week (vs. everyone decided). */
	quiet: boolean;
	decided: number;
	intros: number;
	maybes: number;
	nextDrop: string;
	/** A role to widen when the week was quiet. */
	quietRole: { id: string; name: string } | null;
}

/** Fixes, then people waiting on you, then the rest. Top 3 shown; keys 1–9 open a step, ↵ starts reviewing. */
export function HomeNextMoves({
	orgId,
	steps,
	canEdit,
	caughtUp,
}: {
	orgId: string;
	steps: NextStep[];
	canEdit: boolean;
	caughtUp: CaughtUpWeek | null;
}) {
	const router = useRouter();
	const [open, setOpen] = useState<string | null>(null);
	const [all, setAll] = useState(false);
	const shown = all ? steps : steps.slice(0, SHOWN);
	const numbered = shown.filter((s) => s.kind !== "review" && (canEdit || !isFix(s)));
	const reviewHref = orgRoutes.review(orgId);
	const primary = shown[0] && STEP_GROUP[shown[0].kind] < 3 ? shown[0] : null;

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || open) return;
			if (e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable], button, a")) return;
			if (e.key === "Enter" && steps.some((s) => s.kind === "review")) {
				e.preventDefault();
				router.push(reviewHref);
				return;
			}
			const step = numbered[Number(e.key) - 1];
			if (!step || !canEdit) return;
			e.preventDefault();
			const href = linkFor(orgId, step);
			if (href) router.push(href);
			else setOpen(stepKey(step));
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [numbered, steps, open, orgId, reviewHref, router, canEdit]);

	return (
		<HomeCard title="Next moves" note={steps.length > SHOWN ? `${SHOWN} of ${steps.length}` : `${steps.length} to do`}>
			{!canEdit && <Lede>View only. Ask an owner to request intros.</Lede>}
			{caughtUp && <CaughtUpBlock orgId={orgId} week={caughtUp} />}
			{shown.map((step, i) => {
				const n = numbered.indexOf(step) + 1;
				const group = STEP_GROUP[step.kind];
				const isPrimary = step === primary;
				return (
					<Fragment key={stepKey(step)}>
						{group !== (i > 0 ? STEP_GROUP[shown[i - 1].kind] : 0) && <Band>{GROUP_LABEL[group]}</Band>}
						<StepRow step={step} rank={i + 1} primary={isPrimary}>
							{step.kind === "review" ? (
								<Button
									asChild
									size={isPrimary ? "sm" : "compact"}
									variant={isPrimary ? "primary" : "ghost"}
									className="gap-2"
								>
									<Link href={reviewHref}>
										{!canEdit ? "View" : isPrimary ? "Start reviewing" : "Start"}
										{isPrimary && <Kbd className="bg-white/15 text-white/85 max-lg:hidden">↵</Kbd>}
									</Link>
								</Button>
							) : !canEdit ? (
								<span className="font-v2-body text-v2-text-tertiary text-xs">Ask an owner</span>
							) : isFix(step) ? (
								<FixAction
									orgId={orgId}
									step={step}
									n={n}
									primary={isPrimary}
									open={open === stepKey(step)}
									onOpenChange={(o) => setOpen(o ? stepKey(step) : null)}
								/>
							) : (
								<>
									<Kbd className="max-lg:hidden">{n}</Kbd>
									<Button asChild variant={isPrimary ? "primary" : "ghost"} size="compact">
										<Link href={linkFor(orgId, step) ?? reviewHref}>
											{step.kind === "hiring-manager" ? "Set up" : step.kind === "ats" ? "Connect" : "Finish"}
											<ArrowUpRight size={12} />
										</Link>
									</Button>
								</>
							)}
						</StepRow>
					</Fragment>
				);
			})}
			{steps.length > SHOWN && (
				<div className="flex items-center justify-between gap-3 border-v2-border-divider border-t px-4 py-2.5 font-v2-body text-v2-text-tertiary text-xs max-lg:px-3">
					<span>{!all && `+${steps.length - SHOWN} more to do`}</span>
					<button
						type="button"
						onClick={() => setAll((a) => !a)}
						className="flex items-center gap-1 font-medium text-v2-text-brand hover:underline"
					>
						{all ? "Show less" : "See all"} <ArrowRight size={12} />
					</button>
				</div>
			)}
		</HomeCard>
	);
}

HomeNextMoves.displayName = "HomeNextMoves";

export function Band({ children }: { children: ReactNode }) {
	return (
		<p className="border-v2-border-divider border-t bg-v2-bg-warm px-4 py-1.5 font-medium font-v2-body text-2xs text-v2-text-tertiary uppercase tracking-wider max-lg:px-3">
			{children}
		</p>
	);
}

export function Lede({ children }: { children: ReactNode }) {
	return (
		<p className="border-v2-border-divider border-t px-4 py-3 font-v2-body text-sm text-v2-text-secondary max-lg:px-3">
			{children}
		</p>
	);
}

type FixStep = Extract<NextStep, { kind: "calendar" | "resume" }>;
const isFix = (s: NextStep): s is FixStep => s.kind === "calendar" || s.kind === "resume";
const stepKey = (s: NextStep) => ("roleId" in s ? `${s.kind}:${s.roleId}` : s.kind);

function linkFor(orgId: string, step: NextStep): string | null {
	if (step.kind === "hiring-manager") return orgRoutes.roles.edit(orgId, step.roleId, { highlightHm: true });
	if (step.kind === "profile") return orgRoutes.settings.company(orgId);
	if (step.kind === "ats") return orgRoutes.integrations(orgId);
	return null;
}

const STEP_VIEW: { [K in NextStep["kind"]]: (s: Extract<NextStep, { kind: K }>) => [Icon, Tone, string, string] } = {
	calendar: (s) => [
		CalendarPlus,
		"warning",
		`Add ${firstName(s.hmName)}'s scheduling link`,
		`${s.roleName} · ${candidates(s.freed)} can't book a call directly`,
	],
	"hiring-manager": (s) => [
		UserPlus,
		"warning",
		`Set up a hiring manager for ${s.roleName}`,
		`${candidates(s.freed)} can't book a call directly`,
	],
	review: (s) => {
		const names = s.asked.slice(0, 2).map((i) => firstName(i.talentName));
		const who = s.asked.length > 2 ? `${names.join(", ")} +${s.asked.length - 2}` : names.join(" and ");
		return [
			Tray,
			"ok",
			`Review ${candidates(s.people)}`,
			`${s.asked.length > 0 ? `${who} asked to meet you, first in line · ` : ""}~${s.minutes} min`,
		];
	},
	resume: (s) => [
		Briefcase,
		"info",
		`${candidates(s.freed)} waiting on ${s.roleName}`,
		"Paused. Activate it when you're hiring again.",
	],
	profile: (s) => [Buildings, "neutral", "Finish your company profile", `Missing ${s.missing.join(", ")}`],
	ats: () => [PlugsConnected, "neutral", "Connect your ATS", "Sync roles from Ashby, Greenhouse and more"],
};

function StepRow({
	step,
	rank,
	primary,
	children,
}: {
	step: NextStep;
	rank: number;
	primary: boolean;
	children: ReactNode;
}) {
	const [StepIcon, tone, title, meta] = (STEP_VIEW[step.kind] as (s: NextStep) => [Icon, Tone, string, string])(step);
	return (
		<div
			className={cn(
				"flex items-center gap-3 border-v2-border-divider border-t px-4 py-3 max-lg:flex-wrap max-lg:px-3",
				primary && "bg-gradient-to-r from-v2-status-success-bg to-transparent to-60%",
			)}
		>
			<span className="w-4 shrink-0 text-center font-v2-body text-v2-text-tertiary text-xs tabular-nums">{rank}</span>
			<span className={cn("grid size-8 shrink-0 place-items-center rounded-v2-md", TONE_CLASSES[tone])}>
				<StepIcon size={16} />
			</span>
			<div className="min-w-0 flex-1">
				<p className={cn("font-medium font-v2-body text-v2-text-primary", primary ? "text-[15px]" : "text-sm")}>
					{title}
				</p>
				<div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-v2-body text-v2-text-tertiary text-xs tabular-nums">
					{step.kind === "review" && step.asked.length > 0 && (
						<span className="flex shrink-0">
							{step.asked.slice(0, 4).map((i) => (
								<UserAvatar
									key={`${i.talentId}:${i.roleId}`}
									name={i.talentName}
									generated
									size="xs"
									className="-ml-1.5 border-2 border-v2-bg-card first:ml-0"
								/>
							))}
						</span>
					)}
					<span>{meta}</span>
				</div>
				{step.kind === "review" && step.urgent && (
					<p className="mt-1 flex items-center gap-1.5 font-v2-body text-v2-status-warning text-xs">
						<Lightning size={12} className="shrink-0" />
						{firstName(step.urgent.talentName)} may be hired elsewhere soon
					</p>
				)}
			</div>
			<div
				className={cn("flex shrink-0 items-center gap-2", primary && "max-lg:w-full max-lg:pl-7 max-lg:[&>*]:flex-1")}
			>
				{children}
			</div>
		</div>
	);
}

/** "Nice, you're all done" or "A quiet week", with the week's recap and what's next. */
function CaughtUpBlock({ orgId, week }: { orgId: string; week: CaughtUpWeek }) {
	const reduced = useReducedMotion();
	const [replay, setReplay] = useState(0);
	return (
		<>
			<div className="flex items-center gap-3 border-v2-border-divider border-t bg-gradient-to-r from-v2-status-success-bg to-transparent to-60% px-4 py-3.5 max-lg:px-3">
				<motion.span
					key={replay}
					// Plays once when you land on it: a soft pop and a ripple. Nothing when motion is reduced.
					initial={reduced || week.quiet ? false : { scale: 0.4, rotate: -20 }}
					animate={
						reduced || week.quiet
							? undefined
							: {
									scale: 1,
									rotate: 0,
									boxShadow: ["0 0 0 0 rgba(3,147,101,0.45)", "0 0 0 16px rgba(3,147,101,0)"],
								}
					}
					transition={{
						scale: { type: "spring", stiffness: 380, damping: 14 },
						rotate: { type: "spring", stiffness: 380, damping: 14 },
						// A spring can't run through keyframes, so the ripple is a plain fade.
						boxShadow: { duration: 1.2, ease: "easeOut" },
					}}
					className="grid size-8 shrink-0 place-items-center rounded-full bg-v2-bg-card text-v2-brand-green"
				>
					<CheckCircle size={20} weight="fill" />
				</motion.span>
				<div className="min-w-0 flex-1">
					<p className="font-medium font-v2-body text-[15px] text-v2-text-primary">
						{week.quiet ? "A quiet week" : "Nice, you're all done"}
					</p>
					<p className="mt-0.5 font-v2-body text-v2-text-tertiary text-xs">
						{week.quiet
							? "Nobody new arrived. Everyone you have has a decision."
							: "Every candidate has a decision. New drops and intro requests land here."}
					</p>
				</div>
				{!week.quiet && !reduced && (
					<button
						type="button"
						onClick={() => setReplay((r) => r + 1)}
						className="shrink-0 font-v2-body text-2xs text-v2-text-brand hover:underline"
					>
						Replay
					</button>
				)}
			</div>
			{!week.quiet && (
				<div className="flex flex-wrap gap-1.5 border-v2-border-divider border-t px-4 py-2.5 max-lg:px-3">
					{(
						[
							[week.decided, "decided"],
							[`~${reviewMinutes(week.decided)} min`, "of your time"],
							[week.intros, week.intros === 1 ? "intro" : "intros"],
							[week.maybes, "to revisit"],
						] as const
					).map(([n, label]) => (
						<span
							key={label}
							className="flex items-baseline gap-1 rounded-v2-full bg-v2-bg-warm px-2.5 py-1 font-v2-body text-v2-text-secondary text-xs tabular-nums"
						>
							<b className="font-semibold text-sm text-v2-text-primary">{n}</b>
							{label}
						</span>
					))}
				</div>
			)}
			{week.quiet && week.quietRole && (
				<ActionRow
					icon={Briefcase}
					tone="info"
					title={`Nobody new for ${week.quietRole.name} this week`}
					meta="We're still searching. A wider role brings more people."
				>
					<Button asChild variant="ghost" size="compact">
						<Link href={orgRoutes.roles.edit(orgId, week.quietRole.id)}>
							Widen the role <ArrowUpRight size={12} />
						</Link>
					</Button>
				</ActionRow>
			)}
			<ActionRow
				icon={CalendarCheck}
				tone="neutral"
				title={`Next drop ${week.nextDrop}`}
				meta={
					week.maybes > 0
						? `Meanwhile, ${week.maybes} ${week.maybes === 1 ? "person is" : "people are"} parked on Maybe.`
						: "We'll let you know when it lands."
				}
			>
				{week.maybes > 0 && (
					<Button asChild variant="ghost" size="compact">
						<Link href={withView(orgRoutes.review(orgId), "maybe")}>
							Revisit {week.maybes === 1 ? "your maybe" : `your ${week.maybes} maybes`}
						</Link>
					</Button>
				)}
			</ActionRow>
		</>
	);
}

export function ActionRow({
	icon: RowIcon,
	tone,
	title,
	meta,
	children,
}: {
	icon: Icon;
	tone: Tone;
	title: string;
	meta: string;
	children?: ReactNode;
}) {
	return (
		<div className="flex items-center gap-3 border-v2-border-divider border-t px-4 py-3 max-lg:px-3">
			<span className="w-4 shrink-0" />
			<span className={cn("grid size-8 shrink-0 place-items-center rounded-v2-md", TONE_CLASSES[tone])}>
				<RowIcon size={16} />
			</span>
			<div className="min-w-0 flex-1">
				<p className="font-medium font-v2-body text-sm text-v2-text-primary">{title}</p>
				<p className="mt-0.5 font-v2-body text-v2-text-tertiary text-xs">{meta}</p>
			</div>
			{children && <div className="shrink-0">{children}</div>}
		</div>
	);
}

/** Adding a link and activating a role happen right here: a popover by the button, a bottom sheet on phones. */
function FixAction({
	orgId,
	step,
	n,
	primary,
	open,
	onOpenChange,
}: {
	orgId: string;
	step: FixStep;
	n: number;
	primary: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const isPhone = useMediaQuery("(max-width: 1023px)");
	const title = step.kind === "calendar" ? `${step.hmName}'s scheduling link` : `Activate ${step.roleName}?`;
	const body =
		step.kind === "calendar" ? (
			<CalendarForm orgId={orgId} step={step} touch={isPhone} onDone={() => onOpenChange(false)} />
		) : (
			<ResumeConfirm orgId={orgId} step={step} touch={isPhone} onDone={() => onOpenChange(false)} />
		);
	const trigger = (
		<Button
			variant={primary ? "primary" : "ghost"}
			size={primary ? "sm" : "compact"}
			onClick={() => onOpenChange(!open)}
			aria-expanded={open}
		>
			{step.kind === "calendar" ? "Add link" : "Activate"}
		</Button>
	);

	if (isPhone)
		return (
			<>
				{trigger}
				<Sheet open={open} onOpenChange={onOpenChange}>
					<SheetContent
						side="bottom"
						aria-describedby={undefined}
						onOpenAutoFocus={(e) => e.preventDefault()}
						className={PHONE_SHEET_CLASSES}
					>
						<SheetGrabber />
						<div className="px-1">
							<SheetTitle className="font-medium font-v2-body text-base text-v2-text-primary">{title}</SheetTitle>
							{body}
						</div>
					</SheetContent>
				</Sheet>
			</>
		);

	return (
		<>
			<Kbd>{n}</Kbd>
			<Popover open={open} onOpenChange={onOpenChange}>
				<PopoverTrigger asChild>{trigger}</PopoverTrigger>
				<PopoverContent align="end" sideOffset={8} className="w-80 p-3">
					<p className="font-medium font-v2-body text-sm text-v2-text-primary">{title}</p>
					{body}
				</PopoverContent>
			</Popover>
		</>
	);
}

function CalendarForm({
	orgId,
	step,
	touch,
	onDone,
}: {
	orgId: string;
	step: Extract<NextStep, { kind: "calendar" }>;
	touch: boolean;
	onDone: () => void;
}) {
	const queryClient = useQueryClient();
	const [link, setLink] = useState("");
	const [invalid, setInvalid] = useState(false);
	const save = useMutation({
		mutationFn: async (calendarLink: string) => {
			const result = await companyContacts.update(orgId, step.contactId, { calendarLink });
			if (!result.ok) throw new Error("Couldn't save the link. Try again.");
		},
		onSuccess: () => {
			toast.success(`Saved. Candidates can book ${firstName(step.hmName)} directly now.`);
			onDone();
		},
		onError: (error) => toast.error(error.message),
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: companyKeys.contactOptions(orgId) });
			invalidateOrgDashboard(queryClient);
		},
	});
	const submit = (e: FormEvent) => {
		e.preventDefault();
		const value = link.trim();
		if (!/^https:\/\/\S+\.\S+/.test(value)) return setInvalid(true);
		save.mutate(value);
	};
	return (
		<form onSubmit={submit} noValidate>
			<p className="mt-0.5 mb-2.5 font-v2-body text-v2-text-tertiary text-xs">
				Candidates book their intro call with it.
			</p>
			<Input
				autoFocus={!touch}
				type="url"
				value={link}
				onChange={(e) => {
					setLink(e.target.value);
					setInvalid(false);
				}}
				placeholder="https://cal.com/imogen"
				aria-label="Scheduling link"
				aria-invalid={invalid || undefined}
				// 16px on phones, or iOS zooms the page when the field gets focus.
				className={cn("border-v2-border-default bg-v2-bg-page", touch ? "h-11 text-base" : "h-9 text-sm")}
			/>
			{invalid && (
				<p role="alert" className="mt-1.5 font-v2-body text-v2-status-warning text-xs">
					Paste a link that starts with https://
				</p>
			)}
			<FormButtons touch={touch} pending={save.isPending} label="Save link" onCancel={onDone} />
		</form>
	);
}

function ResumeConfirm({
	orgId,
	step,
	touch,
	onDone,
}: {
	orgId: string;
	step: Extract<NextStep, { kind: "resume" }>;
	touch: boolean;
	onDone: () => void;
}) {
	const queryClient = useQueryClient();
	const resume = useMutation({
		mutationFn: async () => {
			const result = await organizations.updateRole(orgId, step.roleId, { status: "active" });
			if (!result.ok) throw new Error(`Couldn't activate ${step.roleName}. Try again.`);
		},
		onSuccess: () => {
			toast.success(`${step.roleName} is active again`);
			onDone();
		},
		onError: (error) => toast.error(error.message),
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: roleKeys.organizationRolesAll(orgId) });
			invalidateOrgDashboard(queryClient);
		},
	});
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				resume.mutate();
			}}
		>
			<p className="mt-0.5 font-v2-body text-v2-text-tertiary text-xs">
				Activate it to review {step.freed === 1 ? "the candidate" : `${step.freed} candidates`} waiting on it.
			</p>
			<FormButtons touch={touch} pending={resume.isPending} label="Activate role" onCancel={onDone} />
		</form>
	);
}

function FormButtons({
	touch,
	pending,
	label,
	onCancel,
}: {
	touch: boolean;
	pending: boolean;
	label: string;
	onCancel: () => void;
}) {
	return (
		<div className={cn("mt-3 flex gap-2", touch ? "flex-col-reverse" : "justify-end")}>
			<Button type="button" variant="ghost" size={touch ? "default" : "compact"} onClick={onCancel}>
				Cancel
			</Button>
			<Button type="submit" size={touch ? "default" : "compact"} disabled={pending}>
				{pending ? "Saving…" : label}
			</Button>
		</div>
	);
}
