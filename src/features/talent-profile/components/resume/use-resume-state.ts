"use client";

import { useMultipleResumes } from "@v2/hooks/use-multiple-resumes";
import { useResumeData } from "@v2/hooks/use-resume-data";
import { useResumeUpload } from "@v2/hooks/use-resume-upload";
import { useUserRole } from "@v2/hooks/use-user-role";
import { useCallback, useRef, useState } from "react";
import { talentKeys } from "@/lib/query-keys";

type ViewMode = "pdf" | "parsed";

export function useResumeState(talentId: string, initialResumeId?: string) {
	const { isAdmin, canManage } = useUserRole();

	const { selectedResumeId, primaryResumeId, ...restResumes } = useMultipleResumes(talentId, initialResumeId);
	const selectedNonPrimaryResumeId =
		selectedResumeId && selectedResumeId !== primaryResumeId ? selectedResumeId : undefined;
	const { data: resumeData, isLoading: isLoadingResume } = useResumeData(talentId, selectedNonPrimaryResumeId);
	const { upload, isUploading } = useResumeUpload({
		talentId,
		uploadSource: "v2-candidate-profile",
		invalidateKeys: [
			talentKeys.resumeData(talentId),
			talentKeys.resumeList(talentId),
			talentKeys.primaryResume(talentId),
		],
	});

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [viewMode, setViewMode] = useState<ViewMode>("pdf");

	const documentUrl = resumeData?.cv?.document_url || null;
	const structuredData = resumeData?.structured_data || null;
	const hasParsedData = !!structuredData?.meta_info;

	const handleUpload = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			await upload(file);
			if (fileInputRef.current) fileInputRef.current.value = "";
		},
		[upload],
	);

	const toggleViewMode = useCallback(() => {
		setViewMode((prev) => (prev === "pdf" ? "parsed" : "pdf"));
	}, []);

	return {
		talentId,
		canManage,
		isAdmin,
		isLoadingResume,
		documentUrl,
		structuredData,
		hasParsedData,
		viewMode,
		toggleViewMode,
		fileInputRef,
		handleUpload,
		isUploading,
		selectedResumeId,
		primaryResumeId,
		...restResumes,
	};
}
