"use client";

import { Check } from "@phosphor-icons/react/ssr";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@v2/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@v2/components/ui/popover";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@v2/components/ui/sidebar";
import { Skeleton } from "@v2/components/ui/skeleton";
import { useOrganizations } from "@v2/hooks/use-organizations";
import { useUser } from "@v2/hooks/use-user";
import { useState } from "react";
import { AdminOrgSearch } from "./admin-org-search";
import { OrgHeaderButton } from "./org-header-button";
import { OrgLogo } from "./org-logo";

export function OrgSwitcher() {
	const { organizations, currentOrg, loading, setCurrentOrg } = useOrganizations();
	const { profile } = useUser();
	const [adminOpen, setAdminOpen] = useState(false);

	if (loading) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<div className="flex w-full items-center gap-1">
						<Skeleton className="h-8 flex-1" />
					</div>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	if (!currentOrg) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<div className="flex w-full items-center gap-1">
						<SidebarMenuButton size="lg" className="h-8 p-2" disabled>
							<div className="flex aspect-square size-6 items-center justify-center rounded-v2-sm bg-v2-bg-active font-v2-body text-xs font-medium text-v2-text-tertiary">
								?
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-v2-body font-medium text-v2-text-tertiary">No organization</span>
								<span className="truncate font-v2-body text-xs text-v2-text-tertiary">Select an organization</span>
							</div>
						</SidebarMenuButton>
					</div>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	if (profile.role === "admin") {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<Popover open={adminOpen} onOpenChange={setAdminOpen}>
						<div className="flex w-full items-center gap-1">
							<PopoverTrigger asChild>
								<OrgHeaderButton org={currentOrg} interactive />
							</PopoverTrigger>
						</div>
						<PopoverContent side="bottom" align="start" sideOffset={4} className="w-72 max-h-110 p-0">
							<AdminOrgSearch onSelect={() => setAdminOpen(false)} />
						</PopoverContent>
					</Popover>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	if (organizations.length <= 1) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<div className="flex w-full items-center gap-1">
						<OrgHeaderButton org={currentOrg} interactive={false} />
					</div>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<div className="flex w-full items-center gap-1">
						<DropdownMenuTrigger asChild>
							<OrgHeaderButton org={currentOrg} interactive />
						</DropdownMenuTrigger>
					</div>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-v2-lg"
						side="bottom"
						align="start"
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-xs text-v2-text-tertiary">Switch Organization</DropdownMenuLabel>
						<DropdownMenuGroup>
							{organizations.map((org) => (
								<DropdownMenuItem
									key={org.organizationId}
									onClick={() => setCurrentOrg(org.organizationId)}
									className="cursor-pointer"
								>
									<div className="flex flex-1 items-center gap-2">
										<OrgLogo name={org.name} logo={org.logo} size={5} />
										<div className="flex flex-col">
											<span className="font-v2-body text-sm text-v2-text-primary">{org.name}</span>
											<span className="font-v2-body text-xs capitalize text-v2-text-tertiary">{org.role}</span>
										</div>
									</div>
									{org.organizationId === currentOrg.organizationId && <Check className="ml-auto size-4" />}
								</DropdownMenuItem>
							))}
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

OrgSwitcher.displayName = "OrgSwitcher";
