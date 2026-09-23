"use client";

import { CaretUpDown } from "@phosphor-icons/react/ssr";
import { SidebarMenuButton } from "@v2/components/ui/sidebar";
import type { Organization } from "@v2/hooks/use-organizations";
import { cn } from "@v2/lib/utils";
import { forwardRef } from "react";
import { OrgLogo } from "./org-logo";

const OrgHeaderButton = forwardRef<
	HTMLButtonElement,
	{ org: Organization; interactive: boolean } & React.ComponentProps<typeof SidebarMenuButton>
>(({ org, interactive, className, ...props }, ref) => (
	<SidebarMenuButton
		ref={ref}
		size="lg"
		className={cn(
			"h-8 p-2",
			interactive ? "data-[state=open]:bg-v2-bg-active data-[state=open]:text-v2-text-primary" : "pointer-events-none",
			className,
		)}
		{...props}
	>
		<OrgLogo name={org.name} logo={org.logo} size={6} />
		<div className="grid flex-1 text-left text-sm leading-tight">
			<span className="truncate font-v2-body font-medium text-v2-text-primary">{org.name}</span>
			<span className="truncate font-v2-body text-xs capitalize text-v2-text-tertiary">{org.role}</span>
		</div>
		{interactive && <CaretUpDown className="ml-auto size-4" />}
	</SidebarMenuButton>
));
OrgHeaderButton.displayName = "OrgHeaderButton";

export { OrgHeaderButton };
