"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@v2/components/ui/avatar";
import { getInitials } from "@v2/utils/format";

function OrgLogo({ name, logo, size }: { name: string; logo: string | null | undefined; size: 5 | 6 }) {
	const sizeClass = size === 6 ? "size-6" : "size-5";
	if (logo) {
		return (
			<Avatar className={sizeClass}>
				<AvatarImage src={logo} alt={name} />
				<AvatarFallback className="text-xs">{getInitials(name)}</AvatarFallback>
			</Avatar>
		);
	}
	return (
		<div
			className={`flex aspect-square ${sizeClass} items-center justify-center rounded-v2-sm bg-v2-brand-teal font-v2-body text-xs font-medium text-v2-text-inverse`}
		>
			{getInitials(name)}
		</div>
	);
}
OrgLogo.displayName = "OrgLogo";

export { OrgLogo };
