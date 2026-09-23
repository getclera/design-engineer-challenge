"use client";

import { Trash } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { ConfirmDialog } from "@v2/components/ui/confirm-dialog";
import { cn } from "@v2/lib/utils";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { iconButtonClass } from "../header/copy-icon-button";

interface DeleteResumeButtonProps {
	resumeId: string;
	resumeName?: string | null;
	size?: "toolbar-icon" | "compact-icon";
	isDeleting: boolean;
	onDeleteResume: (resumeId: string) => Promise<{ success: boolean; error?: string }>;
}

function DeleteResumeButton({
	resumeId,
	resumeName,
	size = "toolbar-icon",
	isDeleting,
	onDeleteResume,
}: DeleteResumeButtonProps) {
	const [confirmOpen, setConfirmOpen] = useState(false);

	const handleOpen = useCallback(() => setConfirmOpen(true), []);
	const handleCancel = useCallback(() => setConfirmOpen(false), []);
	const handleConfirm = useCallback(async () => {
		const result = await onDeleteResume(resumeId);
		setConfirmOpen(false);
		if (result.success) toast.success("Resume deleted");
		else toast.error(result.error ?? "Failed to delete resume");
	}, [onDeleteResume, resumeId]);

	return (
		<>
			<Button
				variant="ghost"
				size={size}
				className={cn(
					iconButtonClass,
					"size-11 text-v2-status-error",
					size === "compact-icon" ? "md:size-7" : "md:size-8",
				)}
				onClick={handleOpen}
				disabled={isDeleting}
				title="Delete resume"
				aria-label="Delete resume"
			>
				<Trash size={size === "compact-icon" ? 13 : 14} />
			</Button>
			<ConfirmDialog
				open={confirmOpen}
				onCancel={handleCancel}
				onConfirm={handleConfirm}
				title="Delete resume?"
				confirmLabel="Delete resume"
				confirmingLabel="Deleting..."
				isPending={isDeleting}
				variant="destructive"
			>
				<p className="font-v2-body text-sm text-v2-text-secondary">
					{resumeName ?? "This resume"} will be removed permanently.
				</p>
			</ConfirmDialog>
		</>
	);
}
DeleteResumeButton.displayName = "DeleteResumeButton";

export { DeleteResumeButton };
