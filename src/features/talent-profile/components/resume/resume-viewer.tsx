"use client";

import { CloudArrowUp } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Skeleton } from "@v2/components/ui/skeleton";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@v2/components/ui/pdf-viewer"), {
	ssr: false,
	loading: () => <Skeleton className="h-150 w-full rounded-v2-md" />,
});

interface ResumeViewerProps {
	documentUrl: string | null;
	isLoading: boolean;
	canManage: boolean;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function ResumeViewer({ documentUrl, isLoading, canManage, fileInputRef }: ResumeViewerProps) {
	if (isLoading) {
		return <Skeleton className="h-150 w-full rounded-v2-md" />;
	}

	if (!documentUrl) {
		return (
			<div className="rounded-v2-md border border-v2-border-warm bg-v2-bg-card p-8 text-center min-h-75 flex flex-col items-center justify-center gap-3">
				<CloudArrowUp size={32} className="text-v2-text-tertiary" />
				<p className="font-v2-body text-sm text-v2-text-secondary">No resume available</p>
				{canManage && (
					<Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
						Upload resume
					</Button>
				)}
			</div>
		);
	}

	return (
		<div className="flex-1 rounded-v2-md border border-v2-border-warm overflow-hidden bg-white [[data-v2-theme=dark]_&]:invert [[data-v2-theme=dark]_&]:hue-rotate-180 h-[calc(100vh-180px)]">
			<PdfViewer url={documentUrl} hideSidebar />
		</div>
	);
}

ResumeViewer.displayName = "ResumeViewer";
