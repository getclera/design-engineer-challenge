import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { cn } from "@v2/lib/utils";
import { FieldLabel } from "./field-label";

interface SubsectionHeaderProps {
	icon: PhosphorIcon;
	title: string;
	className?: string;
}

function SubsectionHeader({ icon: Icon, title, className }: SubsectionHeaderProps) {
	return (
		<div className={cn("flex items-center gap-1.5", className)}>
			<Icon size={12} className="text-v2-text-muted" />
			<FieldLabel className="text-2xs font-semibold uppercase tracking-widest">{title}</FieldLabel>
		</div>
	);
}
SubsectionHeader.displayName = "SubsectionHeader";

export { SubsectionHeader };
