import type { CompanyContactRow, JobInterviewStageRow, YoeRunRow } from "../../../stubs/db-rows";

type Table<Row> = { $inferSelect: Row };

export declare const schema: {
  companyContactsInCommunication: Table<CompanyContactRow>;
  jobInterviewStagesInJobs: Table<JobInterviewStageRow>;
  aiInteractionYoeRunHistory: Table<YoeRunRow>;
};
