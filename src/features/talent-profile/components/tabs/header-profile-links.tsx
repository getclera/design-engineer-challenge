"use client";

import { GithubLogo, Globe, XLogo } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import type { ReactNode } from "react";
import { ensureProtocol, extractHost, hostRepeatsLabel } from "../../utils/external-links";

interface HeaderProfileLinksProps {
	githubUrl: string | null;
	xUrl: string | null;
	portfolioUrl: string | null;
}

function HeaderProfileLinks({ githubUrl, xUrl, portfolioUrl }: HeaderProfileLinksProps) {
	if (!githubUrl && !xUrl && !portfolioUrl) return null;

	return (
		<span className="flex flex-col items-end gap-1">
			{portfolioUrl && (
				<HeaderLinkButton
					href={portfolioUrl}
					label="Portfolio"
					icon={<Globe size={14} weight="regular" className="text-v2-brand-green" />}
				/>
			)}
			{githubUrl && <HeaderLinkButton href={githubUrl} label="GitHub" icon={<GithubLogo size={14} weight="fill" />} />}
			{xUrl && <HeaderLinkButton href={xUrl} label="X" icon={<XLogo size={14} weight="fill" />} />}
		</span>
	);
}
HeaderProfileLinks.displayName = "HeaderProfileLinks";

interface HeaderLinkButtonProps {
	href: string;
	label: string;
	icon: ReactNode;
}

function HeaderLinkButton({ href, label, icon }: HeaderLinkButtonProps) {
	const host = extractHost(href);
	const showHost = host.length > 0 && !hostRepeatsLabel(host, label);
	return (
		<Button asChild variant="ghost" size="compact" className="gap-1.5" title={`Open ${label.toLowerCase()}`}>
			<a href={ensureProtocol(href)} target="_blank" rel="noopener noreferrer">
				{icon}
				{label}
				{showHost && <span className="max-w-45 truncate text-v2-text-tertiary">{host}</span>}
			</a>
		</Button>
	);
}
HeaderLinkButton.displayName = "HeaderLinkButton";

export { HeaderProfileLinks };
