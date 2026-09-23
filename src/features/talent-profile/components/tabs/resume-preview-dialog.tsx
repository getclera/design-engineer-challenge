"use client";

import { Warning } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogTitle } from "@v2/components/ui/dialog";
import { ErrorBanner } from "@v2/components/ui/error-banner";
import { DynamicPdfViewer } from "@v2/components/ui/pdf-viewer-dynamic";
import { handleDownloadResume } from "@v2/utils/resume-utils";
import { VisuallyHidden } from "radix-ui";
import { useCallback } from "react";
import { useHeaderData } from "../../hooks/use-header-data";
import { getStaleResumeLabel } from "./resume-age";

interface ResumePreviewDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	talentId: string;
	url: string;
	fileName: string;
	uploadedAt?: string | null;
}

function ResumePreviewDialog({ open, onOpenChange, talentId, url, fileName, uploadedAt }: ResumePreviewDialogProps) {
	const staleLabel = getStaleResumeLabel(uploadedAt);
	const { data: headerData } = useHeaderData(talentId);

	const handleDownload = useCallback(() => {
		handleDownloadResume({
			documentUrl: url,
			candidate: { firstname: headerData?.firstname ?? undefined, lastname: headerData?.lastname ?? undefined },
		});
	}, [url, headerData?.firstname, headerData?.lastname]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="md:h-[90vh] md:max-h-[90vh] md:min-h-150 md:w-[calc(100vw-2rem)] md:max-w-320">
				<VisuallyHidden.Root>
					<DialogTitle>{fileName}</DialogTitle>
				</VisuallyHidden.Root>
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-10">
					{staleLabel && (
						<ErrorBanner
							tone="warning"
							icon={<Warning size={16} weight="fill" className="shrink-0" />}
							className="mx-4 mb-2 shrink-0 py-2 text-xs sm:mx-6"
						>
							Uploaded {staleLabel} ago, may be outdated
						</ErrorBanner>
					)}
					<div className="flex min-h-0 flex-1 overflow-hidden">
						{open && <DynamicPdfViewer url={url} hideSidebar onDownload={handleDownload} />}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
ResumePreviewDialog.displayName = "ResumePreviewDialog";

export { ResumePreviewDialog };
