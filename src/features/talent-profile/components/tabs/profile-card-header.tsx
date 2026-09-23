import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { SectionHeading } from "@v2/components/data-display";
import { cn } from "@v2/lib/utils";

interface ProfileCardHeaderProps {
	icon: PhosphorIcon;
	title: string;
	children?: React.ReactNode;
	className?: string;
}

function ProfileCardHeader({ icon: Icon, title, children, className }: ProfileCardHeaderProps) {
	return (
		<div className={cn("flex items-center justify-between px-4 py-2.5 sm:px-5", className)}>
			<div className="flex items-center gap-2">
				<Icon size={16} className="text-v2-text-secondary" />
				<SectionHeading as="h3" className="text-base sm:text-base">
					{title}
				</SectionHeading>
			</div>
			{children}
		</div>
	);
}
ProfileCardHeader.displayName = "ProfileCardHeader";

export { ProfileCardHeader };
