"use client";

import { orgRoutes } from "@clera/route-factory";
import {
	ArrowUpRight,
	Buildings,
	CalendarPlus,
	type Icon,
	PauseCircle,
	PlugsConnected,
	Tray,
	UserPlus,
} from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@v2/components/ui/button";
import { Input } from "@v2/components/ui/input";
import { Kbd } from "@v2/components/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@v2/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@v2/components/ui/sheet";
import { invalidateOrgDashboard, PHONE_SHEET_CLASSES, SheetGrabber } from "@v2/features/org-review";
import { useMediaQuery } from "@v2/hooks/use-media-query";
import { cn } from "@v2/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { companyKeys, roleKeys } from "@/lib/query-keys";
import { companyContacts, organizations } from "@/services/api";
import { HomeCard } from "./home-card";
import type { NextStep } from "./home-summary";

type Tone = "warning" | "info" | "ok" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
	warning: "bg-v2-status-warning-bg text-v2-status-warning",
	info: "bg-v2-status-info-bg text-v2-status-info",
	ok: "bg-v2-status-success-bg text-v2-text-brand-green",
	neutral: "bg-v2-status-neutral-bg text-v2-text-secondary",
};

const firstName = (name: string) => name.split(" ")[0] || name;
const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

/** Ranked by how many people each one frees. Keys 1–9 open a step, ↵ starts reviewing. */
export function HomeNextSteps({ orgId, steps, canEdit }: { orgId: string; steps: NextStep[]; canEdit: boolean }) {
	const router = useRouter();
	const [open, setOpen] = useState<string | null>(null);
	// Only steps with a button get a number, in the order they're shown.
	const numbered = steps.filter((s) => s.kind !== "review" && (canEdit || !isFix(s)));
	const reviewHref = orgRoutes.review(orgId);

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
			if (!step) return;
			e.preventDefault();
			const href = linkFor(orgId, step);
			if (href) router.push(href);
			else setOpen(stepKey(step));
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [numbered, steps, open, orgId, reviewHref, router]);

	return (
		<HomeCard title="Next steps" note="Biggest unblock first">
			{steps.map((step) => {
				const n = numbered.indexOf(step) + 1;
				return (
					<StepRow key={stepKey(step)} step={step}>
						{step.kind === "review" ? (
							<Button asChild size="sm" className="gap-2">
								<Link href={reviewHref}>
									Start reviewing
									<Kbd className="bg-white/15 text-white/85 max-lg:hidden">↵</Kbd>
								</Link>
							</Button>
						) : isFix(step) ? (
							canEdit && (
								<FixAction
									orgId={orgId}
									step={step}
									n={n}
									open={open === stepKey(step)}
									onOpenChange={(o) => setOpen(o ? stepKey(step) : null)}
								/>
							)
						) : (
							<>
								<Kbd className="max-lg:hidden">{n}</Kbd>
								<Button asChild variant="ghost" size="compact">
									<Link href={linkFor(orgId, step) ?? reviewHref}>
										{step.kind === "hiring-manager" ? "Add" : step.kind === "ats" ? "Connect" : "Finish"}
										<ArrowUpRight size={12} />
									</Link>
								</Button>
							</>
						)}
					</StepRow>
				);
			})}
		</HomeCard>
	);
}

HomeNextSteps.displayName = "HomeNextSteps";

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
		`Add ${firstName(s.hmName)}'s calendar link`,
		`${s.roleName} · frees ${s.freed} intros`,
	],
	"hiring-manager": (s) => [UserPlus, "warning", "Add a hiring manager", `${s.roleName} · frees ${s.freed} intros`],
	resume: (s) => [PauseCircle, "info", `Resume ${s.roleName}`, `${people(s.freed)} waiting`],
	review: (s) => [Tray, "ok", `Review ${people(s.people)}`, `About ${s.minutes} min`],
	profile: (s) => [Buildings, "neutral", "Finish your company profile", `Missing ${s.missing.join(", ")}`],
	ats: () => [
		PlugsConnected,
		"neutral",
		"Connect your applicant tracking",
		"Sync roles from Ashby, Greenhouse and more",
	],
};

function StepRow({ step, children }: { step: NextStep; children: ReactNode }) {
	const [StepIcon, tone, title, meta] = (STEP_VIEW[step.kind] as (s: NextStep) => [Icon, Tone, string, string])(step);
	return (
		<div className="flex items-center gap-3 border-v2-border-divider border-t px-4 py-3 first:border-t-0 max-lg:px-3">
			<span className={cn("grid size-8 shrink-0 place-items-center rounded-v2-md", TONE_CLASSES[tone])}>
				<StepIcon size={16} />
			</span>
			<div className="min-w-0 flex-1">
				<p className="font-medium font-v2-body text-sm text-v2-text-primary max-lg:line-clamp-2 lg:truncate">{title}</p>
				<p className="mt-0.5 font-v2-body text-v2-text-tertiary text-xs tabular-nums max-lg:line-clamp-2 lg:truncate">
					{meta}
				</p>
			</div>
			<div className="flex shrink-0 items-center gap-2">{children}</div>
		</div>
	);
}

/** Fix and Resume happen right here: a popover by the button, a bottom sheet on phones. */
function FixAction({
	orgId,
	step,
	n,
	open,
	onOpenChange,
}: {
	orgId: string;
	step: FixStep;
	n: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const isPhone = useMediaQuery("(max-width: 1023px)");
	const title = step.kind === "calendar" ? `${step.hmName}'s calendar link` : `Resume ${step.roleName}?`;
	const body =
		step.kind === "calendar" ? (
			<CalendarForm orgId={orgId} step={step} touch={isPhone} onDone={() => onOpenChange(false)} />
		) : (
			<ResumeConfirm orgId={orgId} step={step} touch={isPhone} onDone={() => onOpenChange(false)} />
		);
	const trigger = (
		<Button variant="ghost" size="compact" onClick={() => onOpenChange(!open)} aria-expanded={open}>
			{step.kind === "calendar" ? "Fix" : "Resume"}
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
			toast.success(`Saved. ${step.roleName} intros can go out now`);
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
				aria-label="Calendar link"
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
			if (!result.ok) throw new Error(`Couldn't resume ${step.roleName}. Try again.`);
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
				{people(step.freed)} move into Review, and new candidates start arriving again.
			</p>
			<FormButtons touch={touch} pending={resume.isPending} label="Resume role" onCancel={onDone} />
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
