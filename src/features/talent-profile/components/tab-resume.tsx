"use client";

import { handleDownloadResume } from "@v2/utils/resume-utils";
import { useCallback } from "react";
import { useHeaderData } from "../hooks/use-header-data";
import { ResumeParsedView } from "./resume/resume-parsed-view";
import { ResumeToolbar } from "./resume/resume-toolbar";
import { ResumeViewer } from "./resume/resume-viewer";
import { useResumeState } from "./resume/use-resume-state";

interface TabResumeProps {
	talentId: string;
	initialResumeId?: string;
}

export function TabResume({ talentId, initialResumeId }: TabResumeProps) {
	const state = useResumeState(talentId, initialResumeId);
	const { data: headerData } = useHeaderData(talentId);

	const handleDownload = useCallback(() => {
		if (!state.documentUrl) return;
		handleDownloadResume({
			documentUrl: state.documentUrl,
			candidate: { firstname: headerData?.firstname ?? undefined, lastname: headerData?.lastname ?? undefined },
		});
	}, [state.documentUrl, headerData?.firstname, headerData?.lastname]);

	return (
		<div className="flex h-full flex-col gap-2 px-4 py-3 sm:px-6">
			<ResumeToolbar
				resumes={state.resumes}
				selectedResumeId={state.selectedResumeId}
				primaryResumeId={state.primaryResumeId}
				hasMultipleResumes={state.hasMultipleResumes}
				documentUrl={state.documentUrl}
				onDownload={handleDownload}
				canManage={state.canManage}
				isUploading={state.isUploading}
				fileInputRef={state.fileInputRef}
				onSelectResume={state.selectResume}
				onSetPrimary={state.setPrimary}
				onDeleteResume={state.deleteResume}
				isDeletingResume={state.isDeleting}
				onUpload={state.handleUpload}
				viewMode={state.viewMode}
				hasParsedData={state.hasParsedData}
				onToggleView={state.toggleViewMode}
			/>

			{state.viewMode === "parsed" && state.structuredData ? (
				<ResumeParsedView data={state.structuredData} />
			) : (
				<ResumeViewer
					documentUrl={state.documentUrl}
					isLoading={state.isLoadingResume}
					canManage={state.canManage}
					fileInputRef={state.fileInputRef}
				/>
			)}
		</div>
	);
}

TabResume.displayName = "TabResume";
