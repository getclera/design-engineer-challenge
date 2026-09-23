import type { PrimaryResumeResponse } from "@/services/api/resumes";
import { json } from "@mock/http";

export async function GET() {
  return json({
    found: false,
    resumeId: null,
    documentUrl: null,
    signedUrl: null,
    displayName: null,
    uploadedAt: null,
  } satisfies PrimaryResumeResponse);
}
