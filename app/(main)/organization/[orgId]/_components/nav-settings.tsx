"use client";

import { orgRoutes } from "@clera/route-factory";
import { Gear, Plugs } from "@phosphor-icons/react/ssr";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@v2/components/ui/sidebar";
import { ContactsActionBadge, useContactsActionNeededCount } from "@v2/features/company-contacts";
import { useOrgFeedbackDialog } from "@v2/features/org-feedback";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { NavFeedback } from "./nav-feedback";

export function NavSettings({ canManageContacts }: { canManageContacts: boolean }) {
	const { orgId } = useParams<{ orgId: string }>();
	const pathname = usePathname();
	const feedbackOpen = useOrgFeedbackDialog((state) => state.open);
	const isActive = !feedbackOpen && (pathname?.startsWith(orgRoutes.settings.root(orgId)) ?? false);
	const integrationsUrl = orgRoutes.integrations(orgId);
	const isIntegrationsActive = !feedbackOpen && pathname === integrationsUrl;
	const actionNeededCount = useContactsActionNeededCount(orgId, canManageContacts);

	return (
		<SidebarGroup className="py-0.5 px-0">
			<SidebarGroupContent>
				<SidebarMenu className="gap-0">
					<NavFeedback />
					<SidebarMenuItem>
						<SidebarMenuButton asChild isActive={isIntegrationsActive} tooltip="Integrations">
							<Link href={integrationsUrl} aria-current={isIntegrationsActive ? "page" : undefined}>
								<Plugs />
								<span>Integrations</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton asChild isActive={isActive} tooltip="Settings">
							<Link href={orgRoutes.settings.company(orgId)} aria-current={isActive ? "page" : undefined}>
								<Gear />
								<span>Settings</span>
								<ContactsActionBadge
									count={actionNeededCount}
									className="ml-auto group-data-[collapsible=icon]:hidden"
								/>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

NavSettings.displayName = "NavSettings";
