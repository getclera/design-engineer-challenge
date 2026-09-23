"use client";

import { orgRoutes } from "@clera/route-factory";
import { Briefcase, Cards, GlobeHemisphereWest, House, Kanban, MagnifyingGlass, Plus } from "@phosphor-icons/react/ssr";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@v2/components/ui/sidebar";
import { useOrgFeedbackDialog } from "@v2/features/org-feedback";
import { orgReviewFiltersKey } from "@v2/features/org-review";
import { orgTalentSearchFiltersKey } from "@v2/features/org-talent-search";
import { usePersistedSearch } from "@v2/hooks/use-persisted-search";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const buildWorkspaceItems = (
	orgId: string,
	reviewSearch: string,
	talentSearchSearch: string,
	showTalentSearch: boolean,
) => [
	{ name: "Home", url: orgRoutes.overview(orgId), href: orgRoutes.overview(orgId), icon: House },
	{
		name: "Review",
		url: orgRoutes.review(orgId),
		href: reviewSearch ? `${orgRoutes.review(orgId)}?${reviewSearch}` : orgRoutes.review(orgId),
		icon: Cards,
	},
	{ name: "Pipeline", url: orgRoutes.pipeline(orgId), href: orgRoutes.pipeline(orgId), icon: Kanban },
	{ name: "Roles", url: orgRoutes.roles.list(orgId), href: orgRoutes.roles.list(orgId), icon: Briefcase },
	...(showTalentSearch
		? [
				{
					name: "Talent Search",
					url: orgRoutes.talentSearch(orgId),
					href: talentSearchSearch
						? `${orgRoutes.talentSearch(orgId)}?${talentSearchSearch}`
						: orgRoutes.talentSearch(orgId),
					icon: MagnifyingGlass,
				},
				{
					name: "External Search",
					url: orgRoutes.externalSearch(orgId),
					href: orgRoutes.externalSearch(orgId),
					icon: GlobeHemisphereWest,
				},
			]
		: []),
];

const PREFIX_MATCH_ITEMS = new Set(["Roles", "Review"]);

export function NavWorkspace({ showTalentSearch }: { showTalentSearch: boolean }) {
	const { orgId } = useParams<{ orgId: string }>();
	const pathname = usePathname();
	const feedbackOpen = useOrgFeedbackDialog((state) => state.open);

	const reviewSearch = usePersistedSearch(orgReviewFiltersKey(orgId));
	const talentSearchSearch = usePersistedSearch(orgTalentSearchFiltersKey(orgId));
	const workspaceItems = buildWorkspaceItems(orgId, reviewSearch, talentSearchSearch, showTalentSearch);
	const createRoleUrl = orgRoutes.roles.new(orgId);
	const isCreatingRole = !feedbackOpen && pathname === createRoleUrl;

	return (
		<SidebarGroup className="py-0.5 px-2">
			<SidebarGroupLabel className="h-6 group-data-[collapsible=icon]:-mt-6">Workspace</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu className="gap-0">
					{workspaceItems.map((item) => {
						const Icon = item.icon;
						const isActive =
							!feedbackOpen &&
							!isCreatingRole &&
							(PREFIX_MATCH_ITEMS.has(item.name) ? pathname?.startsWith(item.url) === true : pathname === item.url);
						return (
							<SidebarMenuItem key={item.name}>
								<SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
									<Link href={item.href} aria-current={isActive ? "page" : undefined}>
										<Icon />
										<span>{item.name}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
				<SidebarMenu className="mt-2 gap-0">
					<SidebarMenuItem>
						<SidebarMenuButton asChild isActive={isCreatingRole} tooltip="Create Role">
							<Link href={createRoleUrl} prefetch aria-current={isCreatingRole ? "page" : undefined}>
								<Plus />
								<span>Create Role</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

NavWorkspace.displayName = "NavWorkspace";
