"use client";

import { ArrowRight, CaretDown, CaretRight, Check, Eye } from "@phosphor-icons/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@v2/components/ui/accordion";
import { Button } from "@v2/components/ui/button";
import { Card } from "@v2/components/ui/card";
import { ErrorBanner } from "@v2/components/ui/error-banner";
import { Textarea } from "@v2/components/ui/textarea";
import { cn } from "@v2/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CompanyCandidateCard } from "./company-card";
import {
	COMPANY_SECTIONS,
	COMPANY_SIZES,
	COMPANY_STAGES,
	type CompanyProfile,
	companyGaps,
	filledReasons,
	looksLikeUrl,
	PITCH_MAX,
	SECTION_OF,
	type SectionId,
	sectionState,
	URL_FIELDS,
	WORK_MODES,
} from "./company-profile";
import { FillFromWebsite, FromWebsite } from "./fill-from-website";
import { focusField } from "./focus-field";
import { FundingRounds } from "./funding-rounds";
import { ImageList, ImagePick } from "./image-drop";
import { ChoiceChips, FIELD_CLASSES, FieldError, FieldLabel, TagInput } from "./settings-fields";
import { useCompanyProfile, useFillFromWebsite, useFundingRounds, useSaveCompanyField } from "./use-company-profile";

type Field = keyof CompanyProfile;

const REASON_HINTS = [
	"The work: what they'll own",
	"The team: who they'll learn from",
	"The upside: growth, equity, mission",
];

/** The one line a closed section shows, so you can tell what's in it without opening it. */
const SUMMARY: Record<SectionId, (p: CompanyProfile) => string> = {
	logo: (p) => (p.logo ? "Added" : ""),
	basic: (p) => [p.name, p.pitch].filter(Boolean).join(" · "),
	details: (p) =>
		[p.size && `${p.size} people`, p.stage, p.funding, p.founded && `since ${p.founded}`].filter(Boolean).join(" · "),
	selling: (p) => `${filledReasons(p)} of 3 pitch bullets`,
	culture: (p) =>
		[`${p.benefits.length + p.culture.length + p.stack.length} tags`, p.locations.join(", ")]
			.filter(Boolean)
			.join(" · "),
	images: (p) => `${p.teamImages.length} team · ${p.productImages.length} product`,
	links: (p) =>
		[looksLikeUrl(p.website) && "Website", looksLikeUrl(p.linkedin) && "LinkedIn", looksLikeUrl(p.jobs) && "Job board"]
			.filter(Boolean)
			.join(" · "),
	funding: (p) => p.rounds.map((r) => `${r.round} ${r.amount}`).join(" · "),
};

const isSection = (key: string): key is SectionId => COMPANY_SECTIONS.some((s) => s.id === key);

/**
 * Settings › Company: one section open at a time. A bar on top shows which sections are done; "Fill from website"
 * answers the empty fields; every field saves as you type; the card on the right is what candidates see.
 */
export function CompanySettings({
	orgId,
	canEdit,
	ownerName,
	focus,
}: {
	orgId: string;
	canEdit: boolean;
	ownerName: string | null;
	/** From Home's "Finish your company profile" (a section) or an older link (a field, like `linkedin`). */
	focus?: string;
}) {
	const { data: profile, isError, refetch } = useCompanyProfile(orgId);
	const { save, savedAt, errors } = useSaveCompanyField(orgId);
	const fill = useFillFromWebsite(orgId);
	const funding = useFundingRounds(orgId);
	// Undecided until the profile is here: then the linked section, or the first one with something missing.
	const [chosen, setChosen] = useState<SectionId | null | undefined>(undefined);
	// Fields "Fill from website" answered, with what was there before, for their Undo.
	const [fromSite, setFromSite] = useState<Partial<CompanyProfile>>({});
	const [previewOpen, setPreviewOpen] = useState(false);
	const readOnly = !canEdit;

	const gapKeys = profile ? companyGaps(profile).map((g) => g.key) : [];
	const gapSignature = gapKeys.join(",");
	const focusSection = focus ? (isSection(focus) ? focus : SECTION_OF[focus as Field]) : undefined;
	const open = chosen === undefined ? (focusSection ?? gapKeys[0] ?? null) : chosen;

	const loaded = !!profile;
	// Only on arrival (and once the fields exist): typing must never scroll the page.
	useEffect(() => {
		if (focus && loaded) focusField(focus);
	}, [focus, loaded]);

	// A section that gets complete on this visit says so, once.
	const lastGaps = useRef<string | null>(null);
	useEffect(() => {
		if (lastGaps.current !== null && canEdit) {
			const now = gapSignature.split(",");
			for (const key of lastGaps.current.split(",").filter(Boolean))
				if (!now.includes(key)) toast.success(`${COMPANY_SECTIONS.find((s) => s.id === key)?.title} done`);
		}
		lastGaps.current = gapSignature;
	}, [gapSignature, canEdit]);

	if (!profile)
		return isError ? (
			<ErrorBanner action={{ label: "Try again", onClick: () => refetch() }}>
				Couldn't load your company profile.
			</ErrorBanner>
		) : null;

	const openSection = (id: SectionId) => {
		setChosen(id);
		focusField(id);
	};
	const edit = <K extends Field>(field: K, value: CompanyProfile[K], opts?: { now?: boolean; invalid?: string }) => {
		if (field in fromSite) setFromSite(({ [field]: _, ...rest }) => rest);
		save(field, value, opts);
	};
	const undoFill = (field: Field) => {
		edit(field, fromSite[field] as CompanyProfile[typeof field], { now: true });
	};
	const runFill = () =>
		fill.mutate(undefined, {
			onSuccess: ({ profile: next, filled, previous }) => {
				setFromSite((marks) => ({ ...previous, ...marks }));
				toast.success(
					filled.length
						? `Filled ${filled.length} empty field${filled.length === 1 ? "" : "s"} from your website`
						: "Nothing to fill: every field has an answer",
				);
				const firstGap = companyGaps(next)[0]?.key;
				if (firstGap) setChosen(firstGap);
			},
			onError: (error) => toast.error(error.message),
		});

	const label = (field: Field, children: ReactNode, note?: ReactNode) => (
		<FieldLabel
			htmlFor={`f-${field}`}
			note={note}
			savedAt={savedAt[field]}
			aside={field in fromSite && <FromWebsite onUndo={() => undoFill(field)} />}
		>
			{children}
		</FieldLabel>
	);
	const text = (
		field: Extract<Field, "name" | "pitch" | "industry" | "funding" | "founded" | (typeof URL_FIELDS)[number]>,
	) => ({
		id: `f-${field}`,
		value: profile[field],
		readOnly,
		"aria-invalid": errors[field] ? true : undefined,
		"aria-describedby": errors[field] ? `e-${field}` : undefined,
		className: cn(FIELD_CLASSES, field in fromSite && "ring-1 ring-v2-status-active"),
		onChange: (e: { target: { value: string } }) => {
			const value = e.target.value;
			const invalid =
				(URL_FIELDS as readonly string[]).includes(field) && value.trim() && !looksLikeUrl(value)
					? "That doesn't look like a link yet"
					: field === "founded" && value.trim() && !/^\d{4}$/.test(value.trim())
						? "A year, like 2021"
						: field === "name" && !value.trim()
							? "The company needs a name"
							: undefined;
			edit(field, value, { invalid });
		},
	});
	const area = (field: "building" | "team", placeholder: string) => (
		<Textarea
			id={`f-${field}`}
			autoGrow
			textareaSize="compact"
			readOnly={readOnly}
			value={profile[field]}
			onChange={(e) => edit(field, e.target.value)}
			placeholder={placeholder}
			className={cn(
				FIELD_CLASSES,
				"min-h-24 resize-none leading-relaxed",
				field in fromSite && "ring-1 ring-v2-status-active",
			)}
		/>
	);
	const tags = (field: "benefits" | "culture" | "stack" | "locations", title: string, placeholder: string) => (
		<Row key={field} field={field}>
			{label(field, title)}
			<TagInput
				id={`f-${field}`}
				label={title}
				values={profile[field]}
				readOnly={readOnly}
				onChange={(v) => edit(field, v, { now: true })}
				placeholder={placeholder}
			/>
		</Row>
	);
	const url = (field: (typeof URL_FIELDS)[number], title: string, placeholder: string, hint?: string) => (
		<Row key={field} field={field} full={field === "jobs"}>
			{label(field, title)}
			<input {...text(field)} type="url" inputMode="url" placeholder={placeholder} />
			<FieldError id={`e-${field}`}>{errors[field]}</FieldError>
			{hint && <p className="font-v2-body text-v2-text-tertiary text-xs">{hint}</p>}
		</Row>
	);

	const BODY: Record<SectionId, ReactNode> = {
		logo: (
			<Row field="logo" full>
				<div className="flex items-center gap-4">
					<ImagePick
						id="f-logo"
						label="Change logo"
						shape="square"
						readOnly={readOnly}
						onPick={(logo) => edit("logo", logo, { now: true })}
					>
						{profile.logo ? (
							// biome-ignore lint/performance/noImgElement: a local SVG or an uploaded data URL
							<img src={profile.logo} alt={`${profile.name} logo`} className="size-full object-cover" />
						) : (
							<span className="block size-full bg-v2-bg-input-solid" />
						)}
					</ImagePick>
					<p className="font-v2-body text-v2-text-tertiary text-xs">PNG, JPG, or WebP, recommended 256×256.</p>
				</div>
			</Row>
		),
		basic: (
			<>
				<Row field="name">
					{label(
						"name",
						<>
							Name<span className="text-v2-status-error">*</span>
						</>,
					)}
					<input {...text("name")} placeholder="Company name" />
					<FieldError id="e-name">{errors.name}</FieldError>
				</Row>
				<Row field="pitch" full>
					{label("pitch", "Description", `${profile.pitch.length}/${PITCH_MAX}`)}
					<input {...text("pitch")} maxLength={PITCH_MAX} placeholder="One line: what you do, for whom" />
				</Row>
				<Row field="building" full>
					{label("building", "Product description")}
					{area("building", "What you build and who uses it")}
				</Row>
				<Row field="team" full>
					{label("team", "About the team", "Optional")}
					{area("team", "Who candidates would work with")}
				</Row>
			</>
		),
		details: (
			<>
				<Row field="size">
					{label("size", "Company size")}
					<ChoiceChips
						id="f-size"
						label="Company size"
						options={COMPANY_SIZES}
						value={profile.size}
						readOnly={readOnly}
						onChange={(v) => edit("size", v, { now: true })}
					/>
				</Row>
				<Row field="industry">
					{label("industry", "Industry")}
					<input {...text("industry")} placeholder="e.g. Fintech" />
				</Row>
				<Row field="founded">
					{label("founded", "Founded year")}
					<input
						{...text("founded")}
						inputMode="numeric"
						maxLength={4}
						placeholder="e.g. 2021"
						className={cn(FIELD_CLASSES, "tabular-nums")}
					/>
					<FieldError id="e-founded">{errors.founded}</FieldError>
				</Row>
				<Row field="stage">
					{label("stage", "Last funding round")}
					<ChoiceChips
						id="f-stage"
						label="Last funding round"
						options={COMPANY_STAGES}
						value={profile.stage}
						readOnly={readOnly}
						onChange={(v) => edit("stage", v, { now: true })}
					/>
				</Row>
				<Row field="funding">
					{label("funding", "Funding amount", "Optional")}
					<input {...text("funding")} placeholder="e.g. $5M" />
				</Row>
				<Row field="mode">
					{label("mode", "Work mode")}
					<ChoiceChips
						id="f-mode"
						label="Work mode"
						options={WORK_MODES}
						value={profile.mode}
						readOnly={readOnly}
						onChange={(v) => edit("mode", v, { now: true })}
					/>
				</Row>
			</>
		),
		selling: (
			<Row field="reasons" full>
				{label("reasons", "Pitch bullets", `${filledReasons(profile)} of 3`)}
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
											? "bg-v2-status-success-bg text-v2-text-brand-green"
											: "border border-v2-border-divider text-v2-text-tertiary",
									)}
								>
									{done ? <Check size={11} weight="bold" /> : i + 1}
								</span>
								<input
									id={i === 0 ? "f-reasons" : undefined}
									aria-label={`Pitch bullet ${i + 1}`}
									value={reason}
									readOnly={readOnly}
									placeholder={REASON_HINTS[i]}
									onChange={(e) => {
										const next = [...profile.reasons] as CompanyProfile["reasons"];
										next[i] = e.target.value;
										edit("reasons", next);
									}}
									className={FIELD_CLASSES}
								/>
							</li>
						);
					})}
				</ol>
				<p className="font-v2-body text-v2-text-tertiary text-xs">Add at least 3</p>
			</Row>
		),
		culture: (
			<>
				{tags("benefits", "Benefits", "e.g. Health insurance")}
				{tags("culture", "Culture", "e.g. Transparency")}
				{tags("stack", "Tech stack", "e.g. TypeScript")}
				{tags("locations", "Office locations", "e.g. Berlin")}
			</>
		),
		images: (
			<>
				<Row field="teamImages" full>
					{label("teamImages", "Team images")}
					<ImageList
						id="f-teamImages"
						label="Team image"
						values={profile.teamImages}
						readOnly={readOnly}
						onChange={(v) => edit("teamImages", v, { now: true })}
					/>
				</Row>
				<Row field="productImages" full>
					{label("productImages", "Product images")}
					<ImageList
						id="f-productImages"
						label="Product image"
						values={profile.productImages}
						readOnly={readOnly}
						onChange={(v) => edit("productImages", v, { now: true })}
					/>
				</Row>
			</>
		),
		links: (
			<>
				{url("website", "Website", "https://")}
				{url("linkedin", "LinkedIn", "https://linkedin.com/company/example")}
				{url(
					"jobs",
					"Job board",
					"https://jobs.ashbyhq.com/acme",
					"Your public careers board. We read it to keep your open roles in sync.",
				)}
			</>
		),
		funding: (
			<Row field="rounds" full>
				<FundingRounds profile={profile} readOnly={readOnly} funding={funding} />
			</Row>
		),
	};

	const nextAfter = (id: SectionId) => {
		const after = COMPANY_SECTIONS.slice(COMPANY_SECTIONS.findIndex((s) => s.id === id) + 1);
		return (after.find((s) => gapKeys.includes(s.id)) ?? after[0])?.id;
	};

	return (
		<div className="flex flex-col gap-4">
			{readOnly && <ViewOnlyNote ownerName={ownerName} />}
			<div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
				<div className="flex min-w-0 flex-col gap-3">
					<Progress profile={profile} readOnly={readOnly} onPick={openSection} />
					{canEdit && <FillFromWebsite website={profile.website} busy={fill.isPending} onFill={runFill} />}
					<Accordion
						type="single"
						collapsible
						value={open ?? ""}
						onValueChange={(value) => setChosen(isSection(value) ? value : null)}
						className="flex flex-col gap-3"
					>
						{COMPANY_SECTIONS.map((section) => {
							const state = sectionState(profile, section.id);
							const next = nextAfter(section.id);
							return (
								<AccordionItem
									key={section.id}
									value={section.id}
									id={`sec-${section.id}`}
									data-field={section.id}
									variant="card"
									className="scroll-mt-4 rounded-v2-lg shadow-v2-card data-[state=open]:shadow-v2-content"
								>
									<AccordionTrigger variant="card" className="md:py-3.5">
										<span className="grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-0.5 sm:grid-cols-[auto_auto_minmax(0,1fr)_auto]">
											<Dot full={!state.missing.length} partial={state.partial} />
											<span className="whitespace-nowrap font-medium font-v2-heading text-base text-v2-text-primary">
												{section.title}
											</span>
											<span className="truncate font-normal font-v2-body text-v2-text-tertiary text-xs max-sm:col-start-2 max-sm:row-start-2">
												{SUMMARY[section.id](profile)}
											</span>
											{state.missing.length ? (
												<span className="whitespace-nowrap font-medium font-v2-body text-v2-status-warning text-xs">
													{state.missing.length === 1
														? `${state.missing[0]} missing`
														: `${state.missing.length} missing`}
												</span>
											) : (
												<span className="inline-flex items-center gap-1 whitespace-nowrap font-medium font-v2-body text-v2-text-brand-green text-xs">
													<Check size={12} weight="bold" /> Done
												</span>
											)}
										</span>
									</AccordionTrigger>
									<AccordionContent variant="card">
										<p className="mb-4 text-pretty font-v2-body text-v2-text-tertiary text-xs">{section.description}</p>
										<div className="grid gap-4 sm:grid-cols-2">{BODY[section.id]}</div>
										{canEdit && next && (
											<div className="mt-4 flex justify-end">
												<Button variant="ghost" size="sm" className="gap-1.5" onClick={() => openSection(next)}>
													Next section <ArrowRight size={14} />
												</Button>
											</div>
										)}
									</AccordionContent>
								</AccordionItem>
							);
						})}
					</Accordion>
				</div>
				<aside className="flex flex-col gap-2 max-lg:order-first lg:sticky lg:top-4" aria-label="What candidates see">
					<button
						type="button"
						aria-expanded={previewOpen}
						onClick={() => setPreviewOpen((o) => !o)}
						className="flex items-center justify-between rounded-v2-lg border border-v2-border-divider bg-v2-bg-card px-4 py-2.5 font-medium font-v2-body text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal lg:hidden"
					>
						What candidates see
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

function Dot({ full, partial }: { full: boolean; partial: boolean }) {
	const reduced = useReducedMotion();
	return (
		<motion.span
			aria-hidden="true"
			key={full ? "full" : "not"}
			initial={full && !reduced ? { scale: 0.3 } : false}
			animate={{ scale: 1 }}
			transition={{ type: "spring", stiffness: 500, damping: 14 }}
			className={cn(
				"size-2.5 shrink-0 rounded-full border-[1.5px]",
				full && "border-v2-brand-green bg-v2-brand-green",
				partial && "border-v2-status-warning bg-linear-to-r from-v2-status-warning from-50% to-transparent to-50%",
				!full && !partial && "border-v2-border-default",
			)}
		/>
	);
}

/** One segment per section: green when done, half when started. Click one to open it. */
function Progress({
	profile,
	readOnly,
	onPick,
}: {
	profile: CompanyProfile;
	readOnly: boolean;
	onPick: (id: SectionId) => void;
}) {
	const reduced = useReducedMotion();
	const states = COMPANY_SECTIONS.map((s) => ({ ...s, ...sectionState(profile, s.id) }));
	const done = states.filter((s) => !s.missing.length).length;
	// Celebrate only a page finished on this visit, not one that was already complete.
	const hadGaps = useRef(done < states.length);
	if (done === states.length)
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
					<p className="font-v2-body text-v2-text-secondary text-xs">Candidates see every section.</p>
				</div>
			</Card>
		);
	return (
		<Card className="flex flex-col gap-2.5 px-4 py-3.5">
			<div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
				<p className="font-medium font-v2-body text-sm text-v2-text-primary tabular-nums">
					{done} of {states.length} sections complete
				</p>
				<p className="font-v2-body text-v2-text-tertiary text-xs">
					{readOnly ? "An owner can fill the rest" : "Click a segment to open that section."}
				</p>
			</div>
			<div className="grid grid-cols-8 gap-1">
				{states.map((s) => (
					<button
						key={s.id}
						type="button"
						onClick={() => onPick(s.id)}
						title={s.title}
						aria-label={`${s.title}: ${s.missing.length ? `${s.missing.length} missing` : "complete"}`}
						className={cn(
							"h-1.5 rounded-full transition-colors duration-300 hover:ring-2 hover:ring-v2-status-active/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal",
							!s.missing.length
								? "bg-v2-brand-green"
								: s.partial
									? "bg-linear-to-r from-v2-status-warning from-50% to-v2-border-divider to-50%"
									: "bg-v2-border-divider",
						)}
					/>
				))}
			</div>
		</Card>
	);
}

export function ViewOnlyNote({ ownerName, extra }: { ownerName: string | null; extra?: ReactNode }) {
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
				to change these.{extra}
			</span>
		</p>
	);
}
