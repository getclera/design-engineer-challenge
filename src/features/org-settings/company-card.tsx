"use client";

import { Briefcase, Globe, Lightning, LinkedinLogo, MapPin, UsersThree } from "@phosphor-icons/react";
import { Card } from "@v2/components/ui/card";
import { cn } from "@v2/lib/utils";
import type { ReactNode } from "react";
import type { CompanyProfile } from "./company-profile";

const Ghost = ({ children }: { children: ReactNode }) => <span className="text-v2-text-muted italic">{children}</span>;

/** What candidates see before an intro: redrawn from the form as you type, gaps shown as gaps. */
export function CompanyCandidateCard({ profile }: { profile: CompanyProfile }) {
	const reasons = profile.reasons.filter((r) => r.trim());
	const where = [profile.mode, ...profile.locations].filter(Boolean).join(" · ");
	const life = [...profile.benefits, ...profile.culture];
	const photos = [...profile.teamImages, ...profile.productImages].slice(0, 3);
	return (
		<Card className="overflow-hidden" aria-label="Preview of your company page">
			<div className="flex items-start gap-3 bg-linear-to-b from-v2-bg-warm to-transparent p-4">
				{profile.logo ? (
					// biome-ignore lint/performance/noImgElement: a local SVG logo, no optimisation to gain
					<img src={profile.logo} alt="" className="size-11 shrink-0 rounded-v2-md" />
				) : (
					<span className="size-11 shrink-0 rounded-v2-md bg-v2-bg-input-solid" />
				)}
				<div className="min-w-0">
					<p className="font-v2-heading text-lg text-v2-text-primary leading-tight">
						{profile.name || <Ghost>Company name</Ghost>}
					</p>
					<p className="mt-0.5 text-pretty font-v2-body text-v2-text-secondary text-xs">
						{profile.pitch || <Ghost>Your description shows here</Ghost>}
					</p>
				</div>
			</div>
			<p className="flex flex-wrap gap-x-2.5 gap-y-1 px-4 pb-3 font-v2-body text-2xs text-v2-text-tertiary">
				{profile.size ? (
					<Fact icon={<UsersThree size={12} />}>{profile.size} people</Fact>
				) : (
					<Ghost>Size missing</Ghost>
				)}
				{profile.stage && (
					<Fact icon={<Lightning size={12} />}>
						{profile.stage}
						{profile.funding && ` · ${profile.funding}`}
					</Fact>
				)}
				{profile.industry && <Fact>{profile.industry}</Fact>}
				{profile.founded && <Fact>Since {profile.founded}</Fact>}
				{where && <Fact icon={<MapPin size={12} />}>{where}</Fact>}
			</p>
			{photos.length > 0 && (
				<div className="grid grid-cols-3 gap-1 border-v2-border-divider border-t px-4 py-2.5">
					{photos.map((src, i) => (
						// biome-ignore lint/performance/noImgElement: uploaded data URLs, nothing for next/image to optimise
						// biome-ignore lint/suspicious/noArrayIndexKey: the same photo can be in both lists
						<img key={i} src={src} alt="" className="aspect-3/2 w-full rounded-v2-sm object-cover" />
					))}
				</div>
			)}
			<Section title="Why join">
				{reasons.length > 0 && (
					<ol className="list-decimal space-y-0.5 pl-4 font-v2-body text-v2-text-primary text-xs">
						{reasons.map((reason) => (
							<li key={reason}>{reason}</li>
						))}
					</ol>
				)}
				{reasons.length < 3 && (
					<p className={cn("font-v2-body text-xs", reasons.length > 0 && "mt-1")}>
						<Ghost>{3 - reasons.length} more to go</Ghost>
					</p>
				)}
			</Section>
			{profile.team.trim() && (
				<Section title="The team">
					<p className="text-pretty font-v2-body text-v2-text-primary text-xs">{profile.team}</p>
				</Section>
			)}
			{life.length > 0 && (
				<Section title="Culture & offering">
					<Chips values={life} />
				</Section>
			)}
			{profile.stack.length > 0 && (
				<Section title="Stack">
					<Chips values={profile.stack} />
				</Section>
			)}
			{profile.rounds.length > 0 && (
				<Section title="Funding">
					<ul className="space-y-0.5 font-v2-body text-v2-text-primary text-xs">
						{profile.rounds.map((round) => (
							<li key={round.id}>
								{round.round} · {round.amount}
								{round.investors && <span className="text-v2-text-tertiary"> · {round.investors}</span>}
							</li>
						))}
					</ul>
				</Section>
			)}
			<div className="flex gap-3 border-v2-border-divider border-t px-4 py-2.5 font-v2-body text-xs">
				<LinkMark on={!!profile.website} icon={<Globe size={13} />} label="Website" />
				<LinkMark on={!!profile.linkedin} icon={<LinkedinLogo size={13} />} label="LinkedIn" />
				<LinkMark on={!!profile.jobs} icon={<Briefcase size={13} />} label="Jobs" />
			</div>
		</Card>
	);
}

CompanyCandidateCard.displayName = "CompanyCandidateCard";

function Fact({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
	return (
		<span className="inline-flex items-center gap-1">
			{icon}
			{children}
		</span>
	);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div className="border-v2-border-divider border-t px-4 py-2.5">
			<p className="mb-1.5 font-medium font-v2-body text-2xs text-v2-text-tertiary uppercase tracking-wider">{title}</p>
			{children}
		</div>
	);
}

function Chips({ values }: { values: string[] }) {
	return (
		<div className="flex flex-wrap gap-1">
			{values.map((value) => (
				<span
					key={value}
					className="rounded-v2-sm border border-v2-border-divider bg-v2-bg-warm px-1.5 py-px font-v2-body text-2xs text-v2-text-secondary"
				>
					{value}
				</span>
			))}
		</div>
	);
}

function LinkMark({ on, icon, label }: { on: boolean; icon: ReactNode; label: string }) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1",
				on ? "text-v2-text-brand" : "text-v2-text-muted line-through opacity-60",
			)}
		>
			{icon}
			{label}
			{!on && <span className="sr-only"> (missing)</span>}
		</span>
	);
}
