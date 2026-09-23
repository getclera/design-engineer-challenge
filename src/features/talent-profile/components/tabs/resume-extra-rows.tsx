"use client";

import { useState } from "react";
import type { ResumeListItem } from "@/services/api/resumes";
import { ResumeRow } from "./resume-row";
import { ShowMoreFooter } from "./show-more-footer";

interface ResumeExtraRowsProps {
	talentId: string;
	resumes: ResumeListItem[];
	onDeleteResume: (resumeId: string) => Promise<{ success: boolean; error?: string }>;
	isDeletingResume: boolean;
}

function ResumeExtraRows({ talentId, resumes, onDeleteResume, isDeletingResume }: ResumeExtraRowsProps) {
	const [expanded, setExpanded] = useState(false);

	const rows = resumes.filter((resume) => resume.document_url);
	if (rows.length === 0) return null;

	return (
		<>
			{expanded && (
				<div className="flex flex-col gap-px">
					{rows.map((resume) => (
						<div key={resume.id} className="px-4 py-2.5 sm:px-5">
							<ResumeRow
								talentId={talentId}
								documentUrl={resume.document_url}
								displayName={resume.display_name || "Resume"}
								uploadedAt={resume.created_at}
								resumeId={resume.id}
								onDeleteResume={onDeleteResume}
								isDeletingResume={isDeletingResume}
							/>
						</div>
					))}
				</div>
			)}
			<ShowMoreFooter expanded={expanded} onToggle={() => setExpanded((v) => !v)} moreCount={rows.length} />
		</>
	);
}
ResumeExtraRows.displayName = "ResumeExtraRows";

export { ResumeExtraRows };
