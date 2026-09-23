"use client";

import { Dialog, DialogContent, DialogTitle } from "@v2/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TabResume } from "../tab-resume";

interface ResumeViewerContextValue {
	open: (resumeId?: string) => void;
}

const ResumeViewerContext = createContext<ResumeViewerContextValue | null>(null);

function useResumeViewer() {
	return useContext(ResumeViewerContext);
}

interface ResumeViewerProviderProps {
	talentId: string;
	children: React.ReactNode;
}

function ResumeViewerProvider({ talentId, children }: ResumeViewerProviderProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [initialResumeId, setInitialResumeId] = useState<string | undefined>(undefined);
	const open = useCallback((resumeId?: string) => {
		setInitialResumeId(resumeId);
		setIsOpen(true);
	}, []);
	const handleOpenChange = useCallback((nextOpen: boolean) => {
		setIsOpen(nextOpen);
		if (!nextOpen) setInitialResumeId(undefined);
	}, []);

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			const isMod = e.metaKey || e.ctrlKey;
			if (isMod && !e.shiftKey && !e.altKey && e.key === "r") {
				e.preventDefault();
				setIsOpen((prev) => !prev);
			}
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const value = useMemo(() => ({ open }), [open]);

	return (
		<ResumeViewerContext.Provider value={value}>
			{children}
			<Dialog open={isOpen} onOpenChange={handleOpenChange}>
				<DialogContent className="md:h-[90vh] md:max-h-[90vh] md:min-h-150 md:w-[calc(100vw-2rem)] md:max-w-320">
					<VisuallyHidden.Root>
						<DialogTitle>Resume viewer</DialogTitle>
					</VisuallyHidden.Root>
					<div className="min-h-0 flex-1 overflow-auto pt-10">
						<TabResume talentId={talentId} initialResumeId={initialResumeId} />
					</div>
				</DialogContent>
			</Dialog>
		</ResumeViewerContext.Provider>
	);
}
ResumeViewerProvider.displayName = "ResumeViewerProvider";

export { ResumeViewerProvider, useResumeViewer };
