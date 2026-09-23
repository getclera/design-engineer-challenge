"use client";

import { GlobeHemisphereWest } from "@phosphor-icons/react";
import { Card } from "@v2/components/ui/card";
import { cn } from "@v2/lib/utils";
import { humanizeKey } from "@v2/utils/format";
import type { MergedProfile } from "@/services/api/talents";
import { ProfileCardHeader } from "./profile-card-header";
import { SourceBadges } from "./source-badge";

type Language = MergedProfile["languages"][number];

interface LanguagesCardProps {
	languages: Language[];
	className?: string;
}

function LanguagesCard({ languages, className }: LanguagesCardProps) {
	if (languages.length === 0) return null;

	return (
		<Card variant="flat" className={cn("overflow-hidden", className)}>
			<ProfileCardHeader icon={GlobeHemisphereWest} title="Languages" />
			<div className="flex flex-wrap gap-1.5 border-t border-v2-border-warm/50 px-4 py-3 sm:px-5">
				{languages.map((lang) => (
					<div
						key={lang.name}
						className="flex items-center gap-1.5 rounded-v2-full border border-v2-border-warm px-2 py-0.5"
					>
						<span className="font-v2-body text-xs font-medium text-v2-text-primary">{lang.name}</span>
						{lang.proficiency && (
							<span className="font-v2-body text-2xs uppercase tracking-wider text-v2-text-muted">
								{humanizeKey(lang.proficiency)}
							</span>
						)}
						<SourceBadges sources={lang.sources} />
					</div>
				))}
			</div>
		</Card>
	);
}
LanguagesCard.displayName = "LanguagesCard";

export { LanguagesCard };
