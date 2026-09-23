"use client";

import { Button } from "@v2/components/ui/button";
import { Checkbox } from "@v2/components/ui/checkbox";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@v2/components/ui/dialog";
import { Label } from "@v2/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@v2/components/ui/select";
import { useRolesList } from "@v2/features/org-roles";
import { useState } from "react";

interface RolePickerModalProps {
	orgId: string;
	isOpen: boolean;
	talentName: string;
	isPending: boolean;
	action?: "request_intro" | "pass";
	onOpenChange: (open: boolean) => void;
	onConfirm: (roleId: string, useForSession?: boolean) => void;
	showSessionPreset?: boolean;
}

export function RolePickerModal({
	orgId,
	isOpen,
	talentName,
	isPending,
	action = "request_intro",
	onOpenChange,
	onConfirm,
	showSessionPreset = false,
}: RolePickerModalProps) {
	const [roleId, setRoleId] = useState<string>("");
	const [useForSession, setUseForSession] = useState(false);

	const { data: roles = [] } = useRolesList(orgId, false, isOpen);
	const activeRoles = roles.filter((r) => r.status === "active");
	const isPass = action === "pass";

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setRoleId("");
			setUseForSession(false);
		}
		onOpenChange(open);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{isPass ? `Pass on ${talentName}` : `Request an intro to ${talentName}`}</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<p className="pb-3 font-v2-body text-sm text-v2-text-tertiary">
						{isPass
							? "Which role are you passing for? We'll record it against that role."
							: "Which role is this intro for? We'll set it up and track it in your pipeline."}
					</p>
					<Select value={roleId} onValueChange={setRoleId}>
						<SelectTrigger aria-label="Select a role">
							<SelectValue placeholder="Select a role" />
						</SelectTrigger>
						<SelectContent>
							{activeRoles.map((role) => (
								<SelectItem key={role.id} value={role.id}>
									{role.position}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{activeRoles.length === 0 && (
						<p className="pt-2 font-v2-body text-v2-status-warning text-xs">
							You have no active roles yet. Create one first.
						</p>
					)}
					{showSessionPreset && (
						<div className="flex items-center space-x-2 pt-4">
							<Checkbox
								id="role-picker-use-for-session"
								checked={useForSession}
								onCheckedChange={(checked) => setUseForSession(checked === true)}
								disabled={isPending}
							/>
							<Label htmlFor="role-picker-use-for-session" className="cursor-pointer font-v2-body text-sm font-normal">
								Use for this session
							</Label>
						</div>
					)}
				</DialogBody>
				<DialogFooter>
					<Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={isPending}>
						Cancel
					</Button>
					<Button variant="primary" disabled={!roleId || isPending} onClick={() => onConfirm(roleId, useForSession)}>
						{isPending ? (isPass ? "Passing…" : "Requesting…") : isPass ? "Continue" : "Request intro"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

RolePickerModal.displayName = "RolePickerModal";
