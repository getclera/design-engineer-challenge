import { type ApiResult, fetchApi } from "./client";

interface PresignedUrlRequest {
	fileName: string;
	contentType: string;
	pathPrefix?: string;
}

interface PresignedUrlResponse {
	signedUrl: string;
	storagePath: string;
	token: string;
}

interface RegisterResumeRequest {
	storagePath: string;
	fileName: string;
	userId?: string;
	talentId?: string;
	uploadSource: string;
	extractText?: boolean;
}

interface RegisterResumeResponse {
	success: boolean;
	filePath: string;
	resumeText?: string;
	resumeTextError?: string;
}

export function getPresignedUploadUrl(data: PresignedUrlRequest): Promise<ApiResult<PresignedUrlResponse>> {
	return fetchApi<PresignedUrlResponse>("/api/resume/upload-url", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export function registerUploadedResume(data: RegisterResumeRequest): Promise<ApiResult<RegisterResumeResponse>> {
	return fetchApi<RegisterResumeResponse>("/api/resume/register", {
		method: "POST",
		body: JSON.stringify(data),
	});
}
