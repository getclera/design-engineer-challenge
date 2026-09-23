"use client";

import { File } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Card } from "@v2/components/ui/card";
import { useMultipleResumes } from "@v2/hooks/use-multiple-resumes";
import { useUserRole } from "@v2/hooks/use-user-role";
import { cn } from "@v2/lib/utils";
import { usePrimaryResume } from "../../hooks/use-primary-resume";
import { ProfileCardHeader } from "./profile-card-header";
import { ResumeExtraRows } from "./resume-extra-rows";
import { ResumeRow } from "./resume-row";
import { useResumeViewer } from "./resume-viewer-context";

interface ResumeCardProps {
	talentId: string;
	scope?: { orgId?: string } | null;
	allowUpload?: boolean;
	className?: string;
}

function ResumeCard({ talentId, scope, allowUpload = false, className }: ResumeCardProps) {
	const manage = scope === undefined;
	const { isAdmin } = useUserRole();
	const resumeViewer = useResumeViewer();
	const { data: resume, isLoading, isError } = usePrimaryResume(talentId, scope);
	const { resumes, primaryResumeId, deleteResume, isDeleting } = useMultipleResumes(manage ? talentId : undefined);
	const extraResumes = manage ? resumes.filter((resume) => resume.id !== primaryResumeId) : [];
	const isEmpty = !isLoading && !isError && !resume?.found;
	const showUpload = allowUpload && resumeViewer !== null;

	if (scope === null) return null;
	if (isError && !resume?.found) return null;
	if (isEmpty && !showUpload) return null;

	return (
		<Card variant="flat" className={cn("overflow-hidden", className)}>
			<ProfileCardHeader icon={File} title="Resume" />
			<div className="border-t border-v2-border-warm/50 px-4 py-2.5 sm:px-5">
				{isEmpty ? (
					<div className="flex items-center gap-2">
						<span className="min-w-0 flex-1 font-v2-body text-xs text-v2-text-muted">No resume on file</span>
						{resumeViewer && (
							<Button variant="ghost" size="compact" className="shrink-0" onClick={() => resumeViewer.open()}>
								Add resume
							</Button>
						)}
					</div>
				) : (
					<ResumeRow
						talentId={talentId}
						scope={scope}
						onDeleteResume={manage && isAdmin ? deleteResume : undefined}
						isDeletingResume={isDeleting}
					/>
				)}
			</div>
			{extraResumes.length > 0 && (
				<ResumeExtraRows
					talentId={talentId}
					resumes={extraResumes}
					onDeleteResume={deleteResume}
					isDeletingResume={isDeleting}
				/>
			)}
		</Card>
	);
}
ResumeCard.displayName = "ResumeCard";

export { ResumeCard };
