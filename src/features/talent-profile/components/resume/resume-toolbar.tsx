"use client";

import { ArrowSquareOut, CloudArrowUp, DownloadSimple, File, FileDashed, Star } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Input } from "@v2/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@v2/components/ui/select";
import { useUserRole } from "@v2/hooks/use-user-role";
import { cn } from "@v2/lib/utils";
import type { ResumeListItem } from "@/services/api/resumes";
import { iconButtonClass } from "../header/copy-icon-button";
import { DeleteResumeButton } from "./delete-resume-button";

interface ResumeToolbarProps {
	resumes: ResumeListItem[];
	selectedResumeId: string | null;
	primaryResumeId: string | null;
	hasMultipleResumes: boolean;
	documentUrl: string | null;
	onDownload?: () => void;
	canManage: boolean;
	isUploading: boolean;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	onSelectResume: (resumeId: string) => void;
	onSetPrimary: (resumeId: string) => Promise<{ success: boolean }>;
	onDeleteResume: (resumeId: string) => Promise<{ success: boolean; error?: string }>;
	isDeletingResume: boolean;
	onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
	viewMode: "pdf" | "parsed";
	hasParsedData: boolean;
	onToggleView: () => void;
}

export function ResumeToolbar({
	resumes,
	selectedResumeId,
	primaryResumeId,
	hasMultipleResumes,
	documentUrl,
	onDownload,
	canManage,
	isUploading,
	fileInputRef,
	onSelectResume,
	onSetPrimary,
	onDeleteResume,
	isDeletingResume,
	onUpload,
	viewMode,
	hasParsedData,
	onToggleView,
}: ResumeToolbarProps) {
	const { isAdmin } = useUserRole();

	return (
		<div className="flex items-center justify-between gap-2 rounded-v2-md border border-v2-border-warm bg-v2-bg-card px-3 py-2">
			<div className="flex items-center gap-1">
				<Button
					variant="ghost"
					size="sm"
					onClick={viewMode === "parsed" ? onToggleView : undefined}
					className={cn(
						"h-8 gap-1.5 px-3 text-xs font-medium",
						viewMode === "pdf" ? "bg-v2-bg-input-solid text-v2-brand-teal" : "text-v2-text-secondary",
					)}
				>
					<File size={14} />
					PDF View
				</Button>
				{hasParsedData && (
					<Button
						variant="ghost"
						size="sm"
						onClick={viewMode === "pdf" ? onToggleView : undefined}
						className={cn(
							"h-8 gap-1.5 px-3 text-xs font-medium",
							viewMode === "parsed" ? "bg-v2-bg-input-solid text-v2-brand-teal" : "text-v2-text-secondary",
						)}
					>
						<FileDashed size={14} />
						Parsed Data
					</Button>
				)}

				{hasMultipleResumes && (
					<Select value={selectedResumeId ?? undefined} onValueChange={onSelectResume}>
						<SelectTrigger tone="warm" size="compact" className="ml-2 w-auto min-w-0 max-w-80 overflow-hidden">
							<SelectValue placeholder="Select resume" className="flex min-w-0 items-center overflow-hidden" />
						</SelectTrigger>
						<SelectContent>
							{resumes.map((resume) => (
								<SelectItem key={resume.id} value={resume.id} size="compact">
									<span className="flex min-w-0 items-center gap-1.5">
										<span className="min-w-0 truncate">{resume.display_name || "Resume"}</span>
										{resume.id === primaryResumeId && (
											<Star size={10} weight="fill" className="text-v2-status-warning shrink-0" />
										)}
									</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
			</div>

			<div className="flex items-center gap-1">
				{canManage && (
					<>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 gap-1.5 rounded-v2-md border border-v2-border-warm px-3 text-xs font-medium"
							onClick={() => fileInputRef.current?.click()}
							disabled={isUploading}
						>
							<CloudArrowUp size={14} />
							Update
						</Button>
						<Input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={onUpload} />
					</>
				)}
				{documentUrl && (
					<>
						<Button
							variant="ghost"
							size="toolbar-icon"
							className={iconButtonClass}
							onClick={onDownload}
							title="Download"
							aria-label="Download"
						>
							<DownloadSimple size={14} />
						</Button>
						<Button
							variant="ghost"
							size="compact"
							className="gap-1.5 border border-v2-border-warm font-medium"
							onClick={() => window.open(documentUrl, "_blank")}
						>
							<ArrowSquareOut size={14} />
							Open
						</Button>
					</>
				)}
				{hasMultipleResumes && selectedResumeId && selectedResumeId !== primaryResumeId && (
					<Button
						variant="ghost"
						size="toolbar-icon"
						className={iconButtonClass}
						onClick={() => onSetPrimary(selectedResumeId)}
						title="Set as primary"
						aria-label="Set as primary"
					>
						<Star size={14} />
					</Button>
				)}
				{selectedResumeId && (isAdmin || (hasMultipleResumes && selectedResumeId !== primaryResumeId)) && (
					<DeleteResumeButton
						resumeId={selectedResumeId}
						resumeName={resumes.find((resume) => resume.id === selectedResumeId)?.display_name}
						isDeleting={isDeletingResume}
						onDeleteResume={onDeleteResume}
					/>
				)}
			</div>
		</div>
	);
}

ResumeToolbar.displayName = "ResumeToolbar";
