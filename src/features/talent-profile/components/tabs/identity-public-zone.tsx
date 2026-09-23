"use client";

import { getFullName } from "@clera/shared-utils";
import { MapPin } from "@phosphor-icons/react";
import { EditableField } from "@v2/components/data-display";
import { LinkedInProfileLink, type OrgTalentTracking } from "@v2/components/tracking";
import { UserAvatar } from "@v2/components/ui/avatar";
import { Badge } from "@v2/components/ui/badge";
import { Identicon } from "@v2/components/ui/identicon";
import { LinkedInIcon } from "@v2/components/ui/linkedin-icon";
import { Skeleton } from "@v2/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@v2/components/ui/tooltip";
import { cn } from "@v2/lib/utils";
import { compactLocation } from "@v2/utils/format";
import type { ReactNode } from "react";
import type { TalentHeaderData } from "@/services/api/talents";
import { ExternalLinks } from "./external-links";

type IdentityHeaderData = Pick<
	TalentHeaderData,
	| "firstname"
	| "lastname"
	| "occupation"
	| "location"
	| "avatarUrl"
	| "openForOpportunities"
	| "linkedinUrl"
	| "portfolioUrl"
	| "githubUrl"
	| "xUrl"
	| "otherLinks"
>;

interface IdentityPublicZoneProps {
	data: IdentityHeaderData;
	onUpdateName?: { firstname: (v: string) => void; lastname: (v: string) => void };
	onUpdateOccupation?: (v: string) => void;
	onUpdateLinks?: {
		portfolio: (v: string) => void;
		github: (v: string) => void;
		x: (v: string) => void;
		clearOther: () => void;
	};
	displayNameOverride?: string | null;
	occupationOverride?: string | null;
	identiconSeed?: string | null;
	talentTags?: string[];
	headerActions?: ReactNode;
	compact?: boolean;
	linkedinTracking?: OrgTalentTracking;
	pending?: boolean;
	className?: string;
}

const NAME_BUTTON = "h-auto w-auto px-1 py-0 text-lg font-v2-heading font-semibold text-v2-text-primary";
const OCCUPATION_BUTTON =
	"h-auto w-auto max-w-[min(24rem,70cqw)] truncate px-1 py-0 text-xs font-v2-body font-light text-v2-text-secondary";
const INLINE_INPUT = "h-auto py-0.5";
const TALENT_TAG_PILL = "h-5 px-2 py-0 text-2xs";
const NAME_TEXT = "max-w-[min(24rem,70cqw)] truncate font-v2-heading text-lg font-semibold text-v2-text-primary";

function IdentityPublicZone({
	data,
	onUpdateName,
	onUpdateOccupation,
	onUpdateLinks,
	displayNameOverride,
	occupationOverride,
	identiconSeed,
	talentTags = [],
	headerActions,
	linkedinTracking,
	pending,
	compact,
	className,
}: IdentityPublicZoneProps) {
	const name = identiconSeed ? null : displayNameOverride || getFullName(data, "Unknown");
	const occupation = occupationOverride || data.occupation;
	const location = compactLocation(data.location);

	return (
		<div className={cn("@container flex items-center gap-3.5", className)}>
			<div className="relative shrink-0">
				<UserAvatar
					src={data.avatarUrl}
					name={name}
					fallback={identiconSeed ? <Identicon seed={identiconSeed} /> : undefined}
					size="lg"
					className={cn("border border-v2-border-warm", compact ? "size-14" : "size-17")}
					fallbackClassName={compact ? undefined : "text-base"}
				/>
				{data.openForOpportunities && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-v2-bg-page bg-v2-brand-green" />
							</TooltipTrigger>
							<TooltipContent side="bottom" className="text-xs">
								Open to opportunities
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="flex flex-wrap items-center gap-1.5">
					{data.linkedinUrl && (
						<LinkedInProfileLink
							url={data.linkedinUrl}
							element="icon"
							label="LinkedIn profile"
							tracking={linkedinTracking}
							className="shrink-0 text-v2-brand-linkedin transition-opacity hover:opacity-80"
						>
							<LinkedInIcon className="size-3.5" />
						</LinkedInProfileLink>
					)}
					{!data.linkedinUrl && !identiconSeed && pending && <Skeleton className="size-3.5 shrink-0" />}
					{onUpdateName ? (
						<>
							<EditableField
								value={data.firstname}
								onChange={(v) => onUpdateName.firstname(String(v))}
								className={NAME_BUTTON}
								inputClassName={INLINE_INPUT}
								placeholder="First"
							/>
							<EditableField
								value={data.lastname}
								onChange={(v) => onUpdateName.lastname(String(v))}
								className={NAME_BUTTON}
								inputClassName={INLINE_INPUT}
								placeholder="Last"
							/>
						</>
					) : data.linkedinUrl ? (
						<LinkedInProfileLink
							url={data.linkedinUrl}
							element="name"
							tracking={linkedinTracking}
							className={cn(NAME_TEXT, "transition-opacity hover:opacity-80")}
						>
							{name}
						</LinkedInProfileLink>
					) : name ? (
						<span className={NAME_TEXT}>{name}</span>
					) : (
						occupation && <span className={NAME_TEXT}>{occupation}</span>
					)}
				</div>

				{onUpdateOccupation ? (
					<EditableField
						value={data.occupation}
						onChange={(v) => onUpdateOccupation(String(v))}
						className={OCCUPATION_BUTTON}
						inputClassName={INLINE_INPUT}
						placeholder="Title / occupation"
					/>
				) : (
					occupation &&
					name && (
						<p className="max-w-[min(24rem,70cqw)] truncate font-v2-body text-xs font-light leading-snug text-v2-text-secondary">
							{occupation}
						</p>
					)
				)}

				{(location || pending) && (
					<div className="flex items-center gap-1 text-v2-text-muted">
						<MapPin size={11} weight="fill" className="shrink-0 opacity-60" />
						<span className="font-v2-body text-xs font-light">
							{location || <Skeleton className="inline-block h-2.5 w-24 align-middle" />}
						</span>
					</div>
				)}

				{talentTags.length === 0 && pending && (
					<div className="mt-1 flex flex-wrap items-center gap-1.5">
						<Skeleton className="h-5 w-16 rounded-v2-full" />
						<Skeleton className="h-5 w-20 rounded-v2-full" />
					</div>
				)}

				{talentTags.length > 0 && (
					<div className="mt-1 flex flex-wrap items-center gap-1.5">
						{talentTags.map((tag) => (
							<Badge key={tag} variant="info" className={TALENT_TAG_PILL}>
								{tag}
							</Badge>
						))}
					</div>
				)}

				{onUpdateLinks && (
					<ExternalLinks
						data={data}
						onUpdatePortfolio={onUpdateLinks.portfolio}
						onUpdateGithub={onUpdateLinks.github}
						onUpdateX={onUpdateLinks.x}
						onClearOtherLinks={onUpdateLinks.clearOther}
					/>
				)}
			</div>

			{headerActions && <div className="shrink-0 self-start">{headerActions}</div>}
		</div>
	);
}
IdentityPublicZone.displayName = "IdentityPublicZone";

export type { IdentityHeaderData };
export { IdentityPublicZone };
