"use client";

import { List } from "@phosphor-icons/react/ssr";
import { SidebarTrigger } from "@v2/components/ui/sidebar";
import { useOrganizations } from "@v2/hooks/use-organizations";
import { OrgLogo } from "./org-logo";

export function MobileOrgHeader() {
	const { currentOrg } = useOrganizations();
	return (
		<div className="flex h-12 items-center gap-1 border-b border-v2-border-default px-2 md:hidden">
			<SidebarTrigger aria-label="Open menu" className="size-9 border-0">
				<List className="size-5" />
			</SidebarTrigger>
			{currentOrg?.name && (
				<div className="flex min-w-0 items-center gap-2 px-1">
					<OrgLogo name={currentOrg.name} logo={currentOrg.logo} size={6} />
					<span className="truncate font-v2-body text-sm font-medium text-v2-text-primary">{currentOrg.name}</span>
				</div>
			)}
		</div>
	);
}

MobileOrgHeader.displayName = "MobileOrgHeader";
