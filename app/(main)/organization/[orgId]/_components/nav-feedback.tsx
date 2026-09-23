"use client";

import { ChatCircleText } from "@phosphor-icons/react/ssr";
import { SidebarMenuButton, SidebarMenuItem } from "@v2/components/ui/sidebar";
import { OrgFeedbackDialog, useOrgFeedbackDialog } from "@v2/features/org-feedback";

export function NavFeedback() {
	const open = useOrgFeedbackDialog((state) => state.open);
	const setOpen = useOrgFeedbackDialog((state) => state.setOpen);

	return (
		<>
			<SidebarMenuItem>
				<SidebarMenuButton tooltip="Feedback" isActive={open} onClick={() => setOpen(true)}>
					<ChatCircleText />
					<span>Feedback</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
			<OrgFeedbackDialog open={open} onOpenChange={setOpen} />
		</>
	);
}

NavFeedback.displayName = "NavFeedback";
