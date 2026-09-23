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

export function TalentEntityChips({ companies, school, className, isLoading }: TalentEntityChipsProps) {
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
			{school && (
				<span className="inline-flex max-w-48 rounded-v2-sm bg-v2-bg-warm px-1.5 py-0.5">
					<LogoLabel logoUrl={school.logoUrl} label={school.name} />
				</span>
			)}
		</div>
	);
}

TalentEntityChips.displayName = "TalentEntityChips";
