import { humanizeKey } from "@clera/shared-utils";
import type {
	interviewStageSchema,
	jobStageDefinitionSchema,
	opportunityCommands,
	trackerListRowSchema,
	trackerOpportunitySchema,
} from "@edge-functions/opportunity-service/commands";
import type { z } from "zod";

export type InterviewStage = z.infer<typeof interviewStageSchema>;
export type JobStageDefinition = z.infer<typeof jobStageDefinitionSchema>;
export type OpportunityTrackerData = z.infer<typeof trackerOpportunitySchema>;
export type TrackerListRow = z.infer<typeof trackerListRowSchema>;

export type InterviewProgressStatus = NonNullable<
	z.infer<(typeof opportunityCommands)["interview"]["update"]["input"]>["status"]
>;

const INTERVIEW_PROGRESS_STATUS_KEYS: Record<InterviewProgressStatus, true> = {
	invited: true,
	scheduled: true,
	rescheduled: true,
	completed: true,
	cancelled: true,
	rejected: true,
	pending: true,
};

export const INTERVIEW_PROGRESS_STATUS_OPTIONS: ReadonlyArray<{ value: InterviewProgressStatus; label: string }> = (
	Object.keys(INTERVIEW_PROGRESS_STATUS_KEYS) as InterviewProgressStatus[]
).map((value) => ({ value, label: humanizeKey(value) }));

export const SCHEDULABLE_INTERVIEW_STATUSES: ReadonlySet<InterviewProgressStatus> = new Set([
	"invited",
	"scheduled",
	"rescheduled",
]);

export function toInterviewProgressStatus(value: string | null | undefined): InterviewProgressStatus {
	return value && value in INTERVIEW_PROGRESS_STATUS_KEYS ? (value as InterviewProgressStatus) : "invited";
}

export interface InterviewTrackerResponse {
	success: boolean;
	data?: {
		opportunities: OpportunityTrackerData[];
	};
	error?: string;
}
