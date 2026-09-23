"use client";

import { FilePdf } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { useState } from "react";
import { usePrimaryResume } from "../../hooks/use-primary-resume";
import { ResumePreviewDialog } from "./resume-preview-dialog";

interface HeaderResumeButtonProps {
	talentId: string;
	scope?: { orgId?: string } | null;
}

function HeaderResumeButton({ talentId, scope }: HeaderResumeButtonProps) {
	const { data: resume } = usePrimaryResume(talentId, scope);
	const [previewOpen, setPreviewOpen] = useState(false);

	if (!resume?.found || !resume.signedUrl) return null;

	return (
		<>
			<Button
				variant="ghost"
				size="compact"
				className="gap-1.5"
				onClick={() => setPreviewOpen(true)}
				title="View resume"
			>
				<FilePdf size={14} weight="fill" className="text-v2-status-error" />
				Resume
			</Button>
			<ResumePreviewDialog
				open={previewOpen}
				onOpenChange={setPreviewOpen}
				talentId={talentId}
				url={resume.signedUrl}
				fileName={resume.displayName ?? "Resume.pdf"}
				uploadedAt={scope?.orgId ? undefined : resume.uploadedAt}
			/>
		</>
	);
}
HeaderResumeButton.displayName = "HeaderResumeButton";

export { HeaderResumeButton };
