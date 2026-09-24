import { Skeleton } from "@v2/components/ui/skeleton";
import { cn } from "@v2/lib/utils";
import { LogoLabel } from "./logo-label";

export interface TalentEntityChip {
	name: string;
	logoUrl: string | null;
}

interface TalentEntityChipsProps {
	companies: TalentEntityChip[];
	school?: TalentEntityChip | null;
	className?: string;
	isLoading?: boolean;
}

const MAX_COMPANIES = 3;

export function TalentEntityChips({ companies: all, school, className, isLoading }: TalentEntityChipsProps) {
	// Feeds repeat companies and some people list many: show each once, the first three, then "+N".
	const unique = all.filter((c, i) => all.findIndex((o) => o.name.toLowerCase() === c.name.toLowerCase()) === i);
	const companies = unique.slice(0, MAX_COMPANIES);
	const hidden = unique.length - companies.length;
	if (isLoading && companies.length === 0 && !school) {
		return (
			<div className={cn("flex items-center gap-1.5", className)} aria-hidden>
				<Skeleton className="h-4.75 w-24 rounded-v2-sm" />
				<Skeleton className="h-4.75 w-16 rounded-v2-sm" />
			</div>
		);
	}
	if (companies.length === 0 && !school) return null;
	return (
		<div className={cn("flex flex-wrap items-center gap-1.5 font-v2-body text-2xs text-v2-text-secondary", className)}>
			{companies.map((c, index) => (
				<span key={`${c.name}-${index}`} className="inline-flex max-w-48 rounded-v2-sm bg-v2-bg-warm px-1.5 py-0.5">
					<LogoLabel logoUrl={c.logoUrl} label={c.name} />
				</span>
			))}
			{hidden > 0 && (
				<span className="rounded-v2-sm bg-v2-bg-warm px-1.5 py-0.5" title={unique.slice(MAX_COMPANIES).map((c) => c.name).join(", ")}>
					+{hidden}
				</span>
			)}
			{school && (
				<span className="inline-flex max-w-48 rounded-v2-sm bg-v2-bg-warm px-1.5 py-0.5">
					<LogoLabel logoUrl={school.logoUrl} label={school.name} />
				</span>
			)}
		</div>
	);
}

TalentEntityChips.displayName = "TalentEntityChips";
