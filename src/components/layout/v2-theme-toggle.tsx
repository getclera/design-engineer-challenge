"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@v2/components/ui/sidebar";
import { useV2Theme } from "@v2/hooks/use-v2-theme";

export function V2ThemeToggle() {
	const { isDark, mounted, toggle } = useV2Theme();
	const label = isDark ? "Switch to light mode" : "Switch to dark mode";

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					onClick={toggle}
					aria-pressed={mounted ? isDark : undefined}
					aria-label={label}
					tooltip={label}
				>
					{isDark ? <Moon /> : <Sun />}
					<span>{isDark ? "Dark mode" : "Light mode"}</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

V2ThemeToggle.displayName = "V2ThemeToggle";
