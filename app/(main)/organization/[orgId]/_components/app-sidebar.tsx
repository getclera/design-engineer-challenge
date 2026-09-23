"use client";

import { V2ThemeToggle } from "@v2/components/layout";
import { UserSidebarProfile } from "@v2/components/layout/user-sidebar-profile";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	SidebarTrigger,
} from "@v2/components/ui/sidebar";
import { OrgSidebarAnnouncement } from "@v2/features/sidebar-announcements";
import { useParams } from "next/navigation";
import { NavSettings } from "./nav-settings";
import { NavWorkspace } from "./nav-workspace";
import { OrgSwitcher } from "./org-switcher";

export function AppSidebar({
	canManageContacts,
	showTalentSearch,
}: {
	canManageContacts: boolean;
	showTalentSearch: boolean;
}) {
	const { orgId } = useParams<{ orgId: string }>();

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
					<div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
						<OrgSwitcher />
					</div>
					<SidebarTrigger className="shrink-0" />
				</div>
			</SidebarHeader>
			<SidebarContent className="gap-2">
				<NavWorkspace showTalentSearch={showTalentSearch} />
			</SidebarContent>
			<SidebarFooter>
				<OrgSidebarAnnouncement orgId={orgId} />
				<NavSettings canManageContacts={canManageContacts} />
				<V2ThemeToggle />
				<UserSidebarProfile />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

AppSidebar.displayName = "AppSidebar";
