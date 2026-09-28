"use client";

import { CaretDown, CaretRight, Check, Eye, WarningCircle } from "@phosphor-icons/react";
import { Card } from "@v2/components/ui/card";
import { Textarea } from "@v2/components/ui/textarea";
import { cn } from "@v2/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { CompanyCandidateCard } from "./company-card";
import {
	COMPANY_SIZES,
	COMPANY_STAGES,
	type CompanyGap,
	type CompanyProfile,
	companyGaps,
	filledReasons,
	type GapKey,
	looksLikeUrl,
	PITCH_MAX,
	URL_FIELDS,
	WORK_MODES,
} from "./company-profile";
import { ChoiceChips, FIELD_CLASSES, FieldError, FieldLabel, TagInput } from "./settings-fields";
import { useCompanyProfile, useSaveCompanyField } from "./use-company-profile";
import { focusField } from "./focus-field";

type Field = keyof CompanyProfile;

const SECTIONS: { id: string; title: string; sub: string; fields: Field[] }[] = [
	{ id: "story", title: "Story", sub: "What candidates read first.", fields: ["pitch", "building", "reasons"] },
	{
		id: "facts",
		title: "Facts",
		sub: "Used to match people who want your stage.",
		fields: ["size", "stage", "founded", "locations"],
	},
	{ id: "life", title: "Life there", sub: "What a normal week feels like.", fields: ["benefits", "culture", "stack"] },
	{ id: "links", title: "Links", sub: "Where candidates check you out.", fields: ["website", "linkedin", "jobs"] },
];

const REASON_HINTS = [
	"The work: what they'll own",
	"The team: who they'll learn from",
	"The upside: growth, equity, mission",
];

function isFilled(profile: CompanyProfile, field: Field) {
	if (field === "reasons") return filledReasons(profile) === 3;
	const value = profile[field];
	return Array.isArray(value) ? value.length > 0 : !!String(value ?? "").trim();
}

/** Settings › Company: the gaps up top, every field saving as you type, and the card candidates will see. */
export function CompanySettings({
	orgId,
	canEdit,
	ownerName,
	focus,
}: {
	orgId: string;
	canEdit: boolean;
	ownerName: string | null;
	/** From Home's "Finish your company profile": open on this field. */
	focus?: string;
}) {
	const { data: profile } = useCompanyProfile(orgId);
	const { save, savedAt, errors } = useSaveCompanyField(orgId);
	const [previewOpen, setPreviewOpen] = useState(false);
	const readOnly = !canEdit;

	const loaded = !!profile;
	// Only on arrival (and once the fields exist): typing must never scroll the page.
	useEffect(() => {
		if (focus && loaded) focusField(focus);
	}, [focus, loaded]);

	if (!profile) return null;
	const gaps = companyGaps(profile);

	const text = (field: Extract<Field, "name" | "pitch" | "funding" | "founded" | (typeof URL_FIELDS)[number]>) => ({
		id: `f-${field}`,
		value: profile[field],
		readOnly,
		"aria-invalid": errors[field] ? true : undefined,
		"aria-describedby": errors[field] ? `e-${field}` : undefined,
		className: FIELD_CLASSES,
		onChange: (e: { target: { value: string } }) => {
			const value = e.target.value;
			const invalid =
				(URL_FIELDS as readonly string[]).includes(field) && value.trim() && !looksLikeUrl(value)
					? "That doesn't look like a link yet"
					: field === "founded" && value.trim() && !/^\d{4}$/.test(value.trim())
						? "A year, like 2021"
						: undefined;
			save(field, value, { invalid });
		},
	});
	const label = (field: Field, children: ReactNode, note?: ReactNode) => (
		<FieldLabel htmlFor={`f-${field}`} note={note} savedAt={savedAt[field]}>
			{children}
		</FieldLabel>
	);

	const FIELDS: Record<string, ReactNode> = {
		name: (
			<Row key="name" field="name" full>
				<div className="flex items-end gap-3">
					{profile.logo && (
						// biome-ignore lint/performance/noImgElement: a local SVG logo, no optimisation to gain
						<img src={profile.logo} alt="Logo" className="size-10 shrink-0 rounded-v2-md" />
					)}
					<div className="flex min-w-0 flex-1 flex-col gap-1.5">
						{label("name", "Company name")}
						<input {...text("name")} />
					</div>
				</div>
				<FieldError id="e-name">{errors.name}</FieldError>
			</Row>
		),
		pitch: (
			<Row key="pitch" field="pitch" full>
				{label("pitch", "One-line pitch", `${profile.pitch.length}/${PITCH_MAX}`)}
				<input {...text("pitch")} maxLength={PITCH_MAX} placeholder="What you do, in one line a candidate remembers" />
			</Row>
		),
		building: (
			<Row key="building" field="building" full>
				{label("building", "What you're building")}
				<Textarea
					id="f-building"
					autoGrow
					textareaSize="compact"
					readOnly={readOnly}
					value={profile.building}
					onChange={(e) => save("building", e.target.value)}
					placeholder="The problem, who has it, and how you fix it. 2–3 sentences."
					className={cn(FIELD_CLASSES, "min-h-24 resize-none leading-relaxed")}
				/>
			</Row>
		),
		reasons: (
			<Row key="reasons" field="reasons" full>
				<FieldLabel note={`${filledReasons(profile)} of 3`} savedAt={savedAt.reasons}>
					3 reasons to join
				</FieldLabel>
				<ol className="flex flex-col gap-1.5">
					{profile.reasons.map((reason, i) => {
						const done = !!reason.trim();
						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: always exactly three slots
							<li key={i} className="flex items-center gap-2">
								<span
									aria-hidden="true"
									className={cn(
										"grid size-5 shrink-0 place-items-center rounded-full font-v2-body text-2xs tabular-nums transition-colors",
										done
											? "bg-v2-status-success-bg text-v2-brand-green"
											: "border border-v2-border-divider text-v2-text-tertiary",
									)}
								>
									{done ? <Check size={11} weight="bold" /> : i + 1}
								</span>
								<input
									id={i === 0 ? "f-reasons" : undefined}
									aria-label={`Reason ${i + 1}`}
									value={reason}
									readOnly={readOnly}
									placeholder={REASON_HINTS[i]}
									onChange={(e) => {
										const next = [...profile.reasons] as CompanyProfile["reasons"];
										next[i] = e.target.value;
										save("reasons", next);
									}}
									className={FIELD_CLASSES}
								/>
							</li>
						);
					})}
				</ol>
				<p className="font-v2-body text-v2-text-tertiary text-xs">
					Specific beats nice. “Your code runs in 40 ports” beats “Great culture”.
				</p>
			</Row>
		),
		size: (
			<Row key="size" field="size" full>
				<FieldLabel savedAt={savedAt.size}>Company size</FieldLabel>
				<ChoiceChips
					id="f-size"
					label="Company size"
					options={COMPANY_SIZES}
					value={profile.size}
					readOnly={readOnly}
					onChange={(v) => save("size", v, { now: true })}
				/>
			</Row>
		),
		stage: (
			<Row key="stage" field="stage">
				<FieldLabel savedAt={savedAt.stage}>Stage</FieldLabel>
				<ChoiceChips
					label="Stage"
					options={COMPANY_STAGES}
					value={profile.stage}
					readOnly={readOnly}
					onChange={(v) => save("stage", v, { now: true })}
				/>
			</Row>
		),
		funding: (
			<Row key="funding" field="funding">
				{label("funding", "Raised so far", "optional")}
				<input {...text("funding")} placeholder="$18M" />
			</Row>
		),
		founded: (
			<Row key="founded" field="founded">
				{label("founded", "Founded")}
				<input
					{...text("founded")}
					inputMode="numeric"
					maxLength={4}
					placeholder="2021"
					className={cn(FIELD_CLASSES, "tabular-nums")}
				/>
				<FieldError id="e-founded">{errors.founded}</FieldError>
			</Row>
		),
		locations: (
			<Row key="locations" field="locations" full>
				<FieldLabel savedAt={savedAt.locations ?? savedAt.mode}>Where people work</FieldLabel>
				<ChoiceChips
					label="Work mode"
					options={WORK_MODES}
					value={profile.mode}
					readOnly={readOnly}
					onChange={(v) => save("mode", v, { now: true })}
				/>
				<TagInput
					id="f-locations"
					label="Cities"
					values={profile.locations}
					readOnly={readOnly}
					onChange={(v) => save("locations", v, { now: true })}
					placeholder="Add a city, press Enter"
				/>
			</Row>
		),
		benefits: tagRow("benefits", "Benefits", "e.g. Health insurance"),
		culture: tagRow("culture", "How you work", "e.g. Async first"),
		stack: tagRow("stack", "Tech stack", "e.g. Rust"),
		website: urlRow("website", "Website", "https://"),
		linkedin: urlRow("linkedin", "LinkedIn", "linkedin.com/company/you"),
		jobs: urlRow(
			"jobs",
			"Job board",
			"https://jobs.ashbyhq.com/you",
			"optional",
			"We read it to keep your open roles in sync.",
		),
	};

	function tagRow(field: "benefits" | "culture" | "stack", title: string, placeholder: string) {
		return (
			<Row key={field} field={field} full>
				<FieldLabel htmlFor={`f-${field}`} savedAt={savedAt[field]}>
					{title}
				</FieldLabel>
				<TagInput
					id={`f-${field}`}
					label={title}
					values={profile?.[field] ?? []}
					readOnly={readOnly}
					onChange={(v) => save(field, v, { now: true })}
					placeholder={placeholder}
				/>
			</Row>
		);
	}
	function urlRow(
		field: (typeof URL_FIELDS)[number],
		title: string,
		placeholder: string,
		note?: string,
		hint?: string,
	) {
		return (
			<Row key={field} field={field} full={field === "jobs"}>
				{label(field, title, note)}
				<input {...text(field)} type="url" inputMode="url" placeholder={placeholder} />
				<FieldError id={`e-${field}`}>{errors[field]}</FieldError>
				{hint && <p className="font-v2-body text-v2-text-tertiary text-xs">{hint}</p>}
			</Row>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{readOnly && <ViewOnlyNote ownerName={ownerName} />}
			<div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[8.5rem_minmax(0,1fr)_18rem]">
				<SectionNav profile={profile} />
				<div className="flex min-w-0 flex-col gap-4">
					<GapsStrip gaps={gaps} readOnly={readOnly} />
					{SECTIONS.map((section) => (
						<Card key={section.id} id={`sec-${section.id}`} className="scroll-mt-4">
							<section aria-labelledby={`h-${section.id}`}>
								<header className="flex items-baseline justify-between gap-3 px-5 pt-4 pb-2 max-sm:flex-col max-sm:gap-0.5 max-lg:px-4">
									<h2 id={`h-${section.id}`} className="font-v2-heading text-lg text-v2-text-primary">
										{section.title}
									</h2>
									<p className="font-v2-body text-v2-text-tertiary text-xs">{section.sub}</p>
								</header>
								<div className="grid gap-4 px-5 pt-1 pb-5 sm:grid-cols-2 max-lg:px-4">
									{(section.id === "story"
										? ["name", ...section.fields]
										: section.id === "facts"
											? ["size", "stage", "funding", "founded", "locations"]
											: section.fields
									).map((field) => FIELDS[field])}
								</div>
							</section>
						</Card>
					))}
				</div>
				<aside className="flex flex-col gap-2 max-lg:order-first lg:sticky lg:top-4" aria-label="What candidates see">
					<button
						type="button"
						aria-expanded={previewOpen}
						onClick={() => setPreviewOpen((open) => !open)}
						className="flex items-center justify-between rounded-v2-lg border border-v2-border-divider bg-v2-bg-card px-4 py-2.5 font-medium font-v2-body text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal lg:hidden"
					>
						See what candidates see
						{previewOpen ? <CaretDown size={14} /> : <CaretRight size={14} />}
					</button>
					<p className="flex items-center gap-1.5 font-medium font-v2-body text-2xs text-v2-text-tertiary uppercase tracking-wider max-lg:hidden">
						<span className="size-1.5 animate-pulse rounded-full bg-v2-brand-green motion-reduce:animate-none" />
						What candidates see
					</p>
					<div className={cn(!previewOpen && "max-lg:hidden")}>
						<CompanyCandidateCard profile={profile} />
					</div>
				</aside>
			</div>
		</div>
	);
}

CompanySettings.displayName = "CompanySettings";

function Row({ field, full, children }: { field: Field; full?: boolean; children: ReactNode }) {
	return (
		<div data-field={field} className={cn("flex min-w-0 flex-col gap-1.5 rounded-v2-md", full && "sm:col-span-2")}>
			{children}
		</div>
	);
}

function SectionNav({ profile }: { profile: CompanyProfile }) {
	return (
		<nav aria-label="Sections" className="sticky top-4 hidden flex-col gap-0.5 xl:flex">
			{SECTIONS.map((section) => {
				const done = section.fields.filter((f) => isFilled(profile, f)).length;
				const state = done === section.fields.length ? "full" : done === 0 ? "none" : "part";
				return (
					<a
						key={section.id}
						href={`#sec-${section.id}`}
						className="flex items-center gap-2.5 rounded-v2-md px-2 py-1.5 font-v2-body text-sm text-v2-text-secondary transition-colors hover:bg-v2-bg-input-solid hover:text-v2-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal"
					>
						<span
							className={cn(
								"size-2 shrink-0 rounded-full border-[1.5px]",
								state === "full" && "border-v2-brand-green bg-v2-brand-green",
								state === "part" &&
									"border-v2-status-warning bg-linear-to-r from-v2-status-warning from-50% to-transparent to-50%",
								state === "none" && "border-v2-border-default",
							)}
						/>
						{section.title}
						<span className="sr-only">
							{state === "full" ? ", complete" : `, ${done} of ${section.fields.length} filled`}
						</span>
					</a>
				);
			})}
		</nav>
	);
}

const RING = 2 * Math.PI * 12;

function GapsStrip({ gaps, readOnly }: { gaps: CompanyGap[]; readOnly: boolean }) {
	const reduced = useReducedMotion();
	// Celebrate only a gap closed on this visit, not a profile that was already complete.
	const hadGaps = useRef(gaps.length > 0);
	if (gaps.length === 0)
		return (
			<Card className="flex items-center gap-3 border-transparent bg-v2-status-success-bg px-4 py-3.5">
				<motion.span
					initial={hadGaps.current && !reduced ? { scale: 0.4, opacity: 0 } : false}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ type: "spring", stiffness: 500, damping: 16 }}
					className="grid size-7.5 shrink-0 place-items-center rounded-full bg-v2-brand-green text-white"
				>
					<Check size={16} weight="bold" />
				</motion.span>
				<div>
					<p className="font-medium font-v2-body text-sm text-v2-text-primary">Your company page is complete</p>
					<p className="font-v2-body text-v2-text-secondary text-xs">Candidates see everything they need to say yes.</p>
				</div>
			</Card>
		);
	const done = 3 - gaps.length;
	return (
		<Card className="px-4 py-3.5 max-lg:px-3">
			<div className="flex items-center gap-2.5">
				<svg viewBox="0 0 30 30" className="size-7.5 shrink-0 -rotate-90" aria-hidden="true">
					<circle cx="15" cy="15" r="12" fill="none" strokeWidth="3.5" className="stroke-v2-border-divider" />
					<circle
						cx="15"
						cy="15"
						r="12"
						fill="none"
						strokeWidth="3.5"
						strokeLinecap="round"
						strokeDasharray={RING}
						strokeDashoffset={RING * (1 - done / 3)}
						className="stroke-v2-brand-green transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
					/>
				</svg>
				<p className="font-medium font-v2-body text-sm text-v2-text-primary">
					{gaps.length} thing{gaps.length > 1 ? "s" : ""} missing
				</p>
				<p className="ml-auto font-v2-body text-v2-text-tertiary text-xs max-sm:hidden">
					{readOnly ? "An owner can fill these" : "Click one to jump there"}
				</p>
			</div>
			<ul className="mt-2 flex flex-col">
				{gaps.map((gap) => (
					<li key={gap.key}>
						<button
							type="button"
							onClick={() => focusField(gap.key as GapKey)}
							className="flex w-full items-center gap-2.5 rounded-v2-md px-1.5 py-2 text-left transition-colors hover:bg-v2-bg-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal"
						>
							<span className="grid size-5.5 shrink-0 place-items-center rounded-full bg-v2-status-warning-bg text-v2-status-warning">
								<WarningCircle size={13} />
							</span>
							<span className="font-v2-body text-sm text-v2-text-secondary">
								<b className="font-medium text-v2-text-primary">{gap.title}.</b> {gap.why}
							</span>
							<CaretRight size={14} className="ml-auto shrink-0 text-v2-text-tertiary" />
						</button>
					</li>
				))}
			</ul>
		</Card>
	);
}

export function ViewOnlyNote({ ownerName }: { ownerName: string | null }) {
	return (
		<p className="flex items-center gap-2 rounded-v2-lg border border-v2-border-divider bg-v2-bg-warm px-3.5 py-2.5 font-v2-body text-sm text-v2-text-secondary">
			<Eye size={16} className="shrink-0 text-v2-text-tertiary" />
			<span>
				View only. Ask an owner
				{ownerName ? (
					<>
						, <b className="font-medium text-v2-text-primary">{ownerName}</b>,
					</>
				) : (
					""
				)}{" "}
				to change these.
			</span>
		</p>
	);
}
