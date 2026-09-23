"use client";

import { GithubLogo, Globe, LinkSimple, X, XLogo } from "@phosphor-icons/react";
import { EditableField } from "@v2/components/data-display";
import { Button } from "@v2/components/ui/button";
import type { TalentHeaderData } from "@/services/api/talents";
import { otherLinkLabel } from "../../utils/external-links";
import { ExternalLinkChip } from "../external-link-chip";

interface ExternalLinksProps {
	data: Pick<TalentHeaderData, "portfolioUrl" | "githubUrl" | "xUrl" | "otherLinks">;
	onUpdatePortfolio?: (v: string) => void;
	onUpdateGithub?: (v: string) => void;
	onUpdateX?: (v: string) => void;
	onClearOtherLinks?: () => void;
}

const LINK_EDIT = "h-auto w-auto px-1 py-0 text-2xs font-v2-body text-v2-text-secondary";
const LINK_INPUT = "h-auto py-0.5 text-2xs";

function ExternalLinks({ data, onUpdatePortfolio, onUpdateGithub, onUpdateX, onClearOtherLinks }: ExternalLinksProps) {
	const portfolio = data.portfolioUrl;
	const github = data.githubUrl;
	const x = data.xUrl;
	const others = data.otherLinks ?? [];
	const isEditable = Boolean(onUpdatePortfolio || onUpdateGithub || onUpdateX);

	if (!isEditable && !portfolio && !github && !x && others.length === 0) return null;

	return (
		<div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
			{onUpdatePortfolio ? (
				<div className="inline-flex items-center gap-1">
					<Globe size={11} weight="regular" className="shrink-0 text-v2-text-secondary" />
					<EditableField
						value={portfolio}
						onChange={(v) => onUpdatePortfolio(String(v))}
						className={LINK_EDIT}
						inputClassName={LINK_INPUT}
						placeholder="Portfolio URL"
						type="url"
					/>
				</div>
			) : (
				portfolio && <ExternalLinkChip href={portfolio} icon={<Globe size={11} weight="regular" />} label="Portfolio" />
			)}
			{onUpdateGithub ? (
				<div className="inline-flex items-center gap-1">
					<GithubLogo size={11} weight="fill" className="shrink-0 text-v2-text-secondary" />
					<EditableField
						value={github}
						onChange={(v) => onUpdateGithub(String(v))}
						className={LINK_EDIT}
						inputClassName={LINK_INPUT}
						placeholder="GitHub URL"
						type="url"
					/>
				</div>
			) : (
				github && <ExternalLinkChip href={github} icon={<GithubLogo size={11} weight="fill" />} label="GitHub" />
			)}
			{onUpdateX ? (
				<div className="inline-flex items-center gap-1">
					<XLogo size={11} weight="fill" className="shrink-0 text-v2-text-secondary" />
					<EditableField
						value={x}
						onChange={(v) => onUpdateX(String(v))}
						className={LINK_EDIT}
						inputClassName={LINK_INPUT}
						placeholder="X URL"
						type="url"
					/>
				</div>
			) : (
				x && <ExternalLinkChip href={x} icon={<XLogo size={11} weight="fill" />} label="X" />
			)}
			{others.map((link) => (
				<ExternalLinkChip
					key={link.address}
					href={link.address}
					icon={<LinkSimple size={11} weight="regular" />}
					label={otherLinkLabel(link)}
				/>
			))}
			{onClearOtherLinks && others.length > 0 && (
				<Button
					variant="ghost"
					size="unstyled"
					className="size-4 rounded-v2-sm text-v2-text-tertiary hover:text-v2-status-error"
					onClick={onClearOtherLinks}
					title="Remove links"
					aria-label="Remove links"
				>
					<X size={10} />
				</Button>
			)}
		</div>
	);
}
ExternalLinks.displayName = "ExternalLinks";

export { ExternalLinks };
