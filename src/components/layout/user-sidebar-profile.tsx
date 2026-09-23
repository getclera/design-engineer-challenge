"use client";

import { Gear, UserCircle } from "@phosphor-icons/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@v2/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@v2/components/ui/sidebar";
import { CurrentUserAvatar } from "@v2/components/user";
import { useUser } from "@v2/hooks/use-user";
import { useUserSignOut } from "@v2/hooks/use-user-sign-out";
import Link from "next/link";

interface UserSidebarProfileProps {
	accountHref?: string;
	settingsHref?: string;
}

export function UserSidebarProfile({ accountHref, settingsHref }: UserSidebarProfileProps) {
	const {
		name,
		profile: { role },
		user: { email },
	} = useUser();
	const signOut = useUserSignOut();
	const { isMobile, setOpenMobile } = useSidebar();
	const closeSheet = () => {
		if (isMobile) setOpenMobile(false);
	};
	const hasLinks = Boolean(accountHref || settingsHref);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton size="lg" tooltip={name} aria-label="Open profile menu">
							<CurrentUserAvatar size="sm" />
							<div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
								<span className="truncate font-v2-body text-sm font-medium text-v2-text-primary">{name}</span>
								<span className="truncate font-v2-body text-xs text-v2-text-tertiary capitalize">{role}</span>
							</div>
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" sideOffset={6} className="min-w-56">
						<DropdownMenuLabel className="truncate text-v2-text-tertiary">{email}</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{accountHref && (
							<DropdownMenuItem asChild>
								<Link href={accountHref} onClick={closeSheet}>
									<UserCircle weight="duotone" />
									Account
								</Link>
							</DropdownMenuItem>
						)}
						{settingsHref && (
							<DropdownMenuItem asChild>
								<Link href={settingsHref} onClick={closeSheet}>
									<Gear weight="duotone" />
									Settings
								</Link>
							</DropdownMenuItem>
						)}
						{hasLinks && <DropdownMenuSeparator />}
						<DropdownMenuItem
							onSelect={(event) => {
								event.preventDefault();
								signOut.mutate();
							}}
							disabled={signOut.isPending}
						>
							{signOut.isPending ? "Signing out…" : "Sign out"}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

UserSidebarProfile.displayName = "UserSidebarProfile";
