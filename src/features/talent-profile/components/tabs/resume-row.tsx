"use client";

import { formatTimeAgo, getFullName } from "@clera/shared-utils";
import { DownloadSimple, Eye, FilePdf } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Skeleton } from "@v2/components/ui/skeleton";
import { cn } from "@v2/lib/utils";
import { handleDownloadResume } from "@v2/utils/resume-utils";
import { useState } from "react";
import { toast } from "sonner";
import { useHeaderData } from "../../hooks/use-header-data";
import { usePrimaryResume } from "../../hooks/use-primary-resume";
import { useResumePreload } from "../../hooks/use-resume-preload";
import { iconButtonClass } from "../header/copy-icon-button";
import { DeleteResumeButton } from "../resume/delete-resume-button";
import { ResumePreviewDialog } from "./resume-preview-dialog";
import { useResumeViewer } from "./resume-viewer-context";

interface ResumeRowProps {
	talentId: string;
	documentUrl?: string | null;
	uploadedAt?: string | null;
	displayName?: string | null;
	resumeId?: string;
	onDeleteResume?: (resumeId: string) => Promise<{ success: boolean; error?: string }>;
	isDeletingResume?: boolean;
	scope?: { orgId?: string } | null;
	className?: string;
}

function ResumeRow({
	talentId,
	documentUrl: urlProp,
	uploadedAt,
	displayName,
	resumeId,
	onDeleteResume,
	isDeletingResume = false,
	scope,
	className,
}: ResumeRowProps) {
	const explicit = urlProp !== undefined;
	const { data: resume, isLoading } = usePrimaryResume(talentId, explicit ? null : scope);
	const { data: headerData } = useHeaderData(talentId);
	const resumeViewer = useResumeViewer();
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const preloadedUrl = useResumePreload(
		talentId,
		!resumeViewer && !explicit ? (resume?.signedUrl ?? undefined) : undefined,
		scope?.orgId,
		resume?.resumeId,
	);

	const fullName = getFullName(headerData ?? {}, "");
	const documentUrl = explicit ? (urlProp ?? "") : (resume?.signedUrl ?? "");
	const effectiveUploadedAt = scope?.orgId ? undefined : (uploadedAt ?? resume?.uploadedAt);
	const effectiveResumeId = resumeId ?? resume?.resumeId ?? undefined;
	const fileName =
		displayName || resume?.displayName || (fullName ? `${fullName.replace(/\s+/g, "_")}_Resume.pdf` : "Resume.pdf");
	const loading = !explicit && isLoading;

	if (!explicit && !isLoading && !resume?.found) return null;
	if (explicit && !documentUrl) return null;

	const handleView = () => {
		if (!documentUrl) {
			toast.error("Resume not available");
			return;
		}
		if (resumeViewer?.open) {
			resumeViewer.open(effectiveResumeId);
		} else {
			setPreviewUrl(preloadedUrl ?? documentUrl);
			setPreviewOpen(true);
		}
	};

	const handleDownload = () => {
		if (!documentUrl) {
			toast.error("Resume not available");
			return;
		}
		handleDownloadResume({
			documentUrl,
			candidate: { firstname: headerData?.firstname ?? undefined, lastname: headerData?.lastname ?? undefined },
		});
	};

	return (
		<div className={cn("flex items-center gap-2", className)}>
			{loading ? (
				<>
					<Skeleton className="size-3.5 shrink-0 rounded-v2-sm" />
					<Skeleton className="h-3 w-24 flex-1" />
					<Skeleton className="h-7 w-24 shrink-0 rounded-v2-sm" />
				</>
			) : (
				<>
					<Button
						type="button"
						variant="unstyled"
						size="unstyled"
						onClick={handleView}
						title="View resume (r)"
						className="flex min-w-0 flex-1 items-center gap-2 text-left transition-colors hover:text-v2-text-primary"
					>
						<FilePdf size={14} weight="fill" className="shrink-0 text-v2-status-error" />
						<div className="flex min-w-0 flex-1 flex-col">
							<span className="truncate font-v2-body text-xs font-medium text-v2-text-secondary">{fileName}</span>
							{effectiveUploadedAt && (
								<span className="font-v2-body text-2xs text-v2-text-muted">
									uploaded {formatTimeAgo(effectiveUploadedAt)}
								</span>
							)}
						</div>
					</Button>
					<div className="flex shrink-0 items-center gap-1">
						<Button
							variant="ghost"
							size="compact-icon"
							className={iconButtonClass}
							onClick={handleView}
							title="View resume (r)"
							aria-label="View resume"
						>
							<Eye size={13} />
						</Button>
						<Button variant="ghost" size="compact" className="gap-1.5" onClick={handleDownload}>
							<DownloadSimple size={13} />
							Download
						</Button>
						{effectiveResumeId && onDeleteResume && (
							<DeleteResumeButton
								resumeId={effectiveResumeId}
								resumeName={fileName}
								size="compact-icon"
								isDeleting={isDeletingResume}
								onDeleteResume={onDeleteResume}
							/>
						)}
					</div>
				</>
			)}
			{!resumeViewer && documentUrl && (
				<ResumePreviewDialog
					open={previewOpen}
					onOpenChange={setPreviewOpen}
					talentId={talentId}
					url={previewUrl ?? documentUrl}
					fileName={fileName}
					uploadedAt={effectiveUploadedAt}
				/>
			)}
		</div>
	);
}
ResumeRow.displayName = "ResumeRow";

export { ResumeRow };
