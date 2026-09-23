"use client";

import { Prohibit } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { ConfirmDialog } from "@v2/components/ui/confirm-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@v2/components/ui/tooltip";
import { cn } from "@v2/lib/utils";
import { useState } from "react";
import { useAdminPass } from "./hooks/use-admin-pass";
import type { ReviewItem } from "./types";

interface AdminPassButtonProps {
	orgId: string;
	item: ReviewItem;
	roleId?: string;
	iconOnly?: boolean;
	className?: string;
}

const RED_GHOST = "text-v2-status-error hover:bg-v2-status-error/10 hover:text-v2-status-error";

export function AdminPassButton({ orgId, item, roleId, iconOnly = false, className }: AdminPassButtonProps) {
	const [open, setOpen] = useState(false);
	const adminPass = useAdminPass(orgId, roleId);
	if (!item.roleId) return null;

	const openDialog = (e: React.MouseEvent) => {
		e.stopPropagation();
		setOpen(true);
	};

	return (
		<>
			{iconOnly ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							aria-label="Admin pass"
							className={cn("shrink-0", RED_GHOST, className)}
							onClick={openDialog}
						>
							<Prohibit size={16} weight="bold" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="top" className="max-w-56">
						Admin pass: removes this candidate from review and Passed. Admin only.
					</TooltipContent>
				</Tooltip>
			) : (
				<Button variant="ghost" size="sm" className={cn("gap-1.5", RED_GHOST, className)} onClick={openDialog}>
					<Prohibit size={14} weight="bold" />
					Admin pass
				</Button>
			)}
			<ConfirmDialog
				open={open}
				onCancel={() => setOpen(false)}
				onConfirm={() => {
					setOpen(false);
					adminPass.mutate(item);
				}}
				title={`Admin pass on ${item.talentName}?`}
				confirmLabel="Admin pass"
				variant="destructive"
			>
				Removes this candidate from the review queue and the Passed tab of this dashboard. The client is not notified.
				Admin only.
			</ConfirmDialog>
		</>
	);
}
AdminPassButton.displayName = "AdminPassButton";
