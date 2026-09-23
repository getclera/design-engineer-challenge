"use client";

import { TalentResumeEvents } from "@clera/posthog-events";
import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import type { PersistedUpload, UploadStatus } from "@v2/lib/stores/resume-upload";
import { useResumeUploadStore } from "@v2/lib/stores/resume-upload";
import { useCallback, useRef } from "react";
import { getPresignedUploadUrl, registerUploadedResume } from "@/services/api/resume-upload";
import logger from "@/utils/logger";
import { validateFile } from "@/utils/validateFile";
import { useLazyPostHog } from "./use-lazy-posthog";

export interface UseResumeUploadOptions {
	talentId?: string;
	userId?: string;
	uploadSource: string;
	sessionKey?: string;
	skipRegistration?: boolean;
	pathPrefix?: string;
	pdfOnly?: boolean;
	extractText?: boolean;
	invalidateKeys?: QueryKey[];
	onSuccess?: (result: {
		storagePath: string;
		fileName: string;
		resumeText?: string;
		resumeTextError?: string;
	}) => void;
	onError?: (error: string) => void;
}

interface UseResumeUploadReturn {
	status: UploadStatus;
	progress: number;
	error: string | null;
	storagePath: string | null;
	fileName: string | null;
	isUploading: boolean;
	isComplete: boolean;
	isOwnSession: boolean;
	upload: (file: File) => Promise<{ storagePath: string }>;
	cancel: () => void;
	reset: () => void;
	persistedUpload: PersistedUpload | null;
}

function isTransientUploadFailure(message: string, statusCode: number | undefined): boolean {
	if (statusCode !== undefined) {
		return statusCode === 0 || statusCode === 408 || statusCode === 429 || statusCode >= 500;
	}
	return message === "Upload failed" || message.startsWith("Upload timed out");
}

export function useResumeUpload(options: UseResumeUploadOptions): UseResumeUploadReturn {
	const {
		talentId,
		userId,
		uploadSource,
		sessionKey,
		skipRegistration = false,
		pathPrefix,
		pdfOnly = false,
		extractText,
		invalidateKeys,
		onSuccess,
		onError,
	} = options;

	const store = useResumeUploadStore();
	const queryClient = useQueryClient();
	const { capture: capturePostHog } = useLazyPostHog();
	const xhrRef = useRef<XMLHttpRequest | null>(null);

	const onSuccessRef = useRef(onSuccess);
	onSuccessRef.current = onSuccess;
	const onErrorRef = useRef(onError);
	onErrorRef.current = onError;

	const session = store.session;
	const status = session?.status ?? "idle";
	const progress = session?.progress ?? 0;
	const error = session?.error ?? null;
	const storagePath = session?.storagePath ?? null;
	const fileName = session?.fileName ?? null;

	const persistedUpload = sessionKey ? store.getPersistedUpload(sessionKey) : null;

	const upload = useCallback(
		async (file: File): Promise<{ storagePath: string }> => {
			const currentStatus = useResumeUploadStore.getState().session?.status;
			if (currentStatus === "uploading" || currentStatus === "getting-url" || currentStatus === "registering") {
				throw new Error("Upload already in progress");
			}

			const validation = validateFile(file, pdfOnly);
			if (!validation.valid) {
				const errMsg = validation.error ?? "Invalid file";
				if (useResumeUploadStore.getState().session?.status !== "complete") {
					store.startUpload(file.name, file.size, uploadSource);
				}
				store.setError(errMsg);
				onErrorRef.current?.(errMsg);
				throw new Error(errMsg);
			}

			store.startUpload(file.name, file.size, uploadSource);

			capturePostHog(TalentResumeEvents.RESUME_UPLOAD_STARTED, {
				file_name: file.name,
				file_size: file.size,
				file_type: file.type || "unknown",
				upload_source: uploadSource,
			});

			let failedStep: "get_url" | "upload" | "register" | null = null;
			let resumeText: string | undefined;
			let resumeTextError: string | undefined;
			let failedStatusCode: number | undefined;
			let retryCount = 0;

			const putFile = (signedUrl: string) =>
				new Promise<void>((resolve, reject) => {
					const xhr = new XMLHttpRequest();
					xhrRef.current = xhr;

					xhr.timeout = 120_000;

					xhr.upload.addEventListener("progress", (e) => {
						if (e.lengthComputable) {
							const uploadPercent = (e.loaded / e.total) * 60;
							store.updateProgress(10 + uploadPercent);
						}
					});

					xhr.addEventListener("load", () => {
						xhrRef.current = null;
						if (xhr.status >= 200 && xhr.status < 300) {
							resolve();
						} else {
							failedStatusCode = xhr.status;
							reject(new Error(`Upload failed with status ${xhr.status}`));
						}
					});

					xhr.addEventListener("error", () => {
						xhrRef.current = null;
						reject(new Error("Upload failed"));
					});

					xhr.addEventListener("abort", () => {
						xhrRef.current = null;
						reject(new Error("Upload cancelled"));
					});

					xhr.addEventListener("timeout", () => {
						xhrRef.current = null;
						reject(new Error("Upload timed out — please check your connection and try again")); // v2-precheck-ignore em-dash
					});

					xhr.open("PUT", signedUrl);
					xhr.setRequestHeader("Content-Type", file.type || "application/pdf");
					xhr.setRequestHeader("x-upsert", "true");
					xhr.send(file);
				});

			let path = "";

			try {
				for (;;) {
					try {
						failedStep = "get_url";
						store.setStatus("getting-url");
						store.updateProgress(5);
						const urlResult = await getPresignedUploadUrl({
							fileName: file.name,
							contentType: file.type || "application/pdf",
							pathPrefix,
						});

						if (!urlResult.ok) {
							failedStatusCode = urlResult.error.status;
							throw new Error("Failed to get upload URL");
						}

						const { signedUrl, storagePath: freshPath } = urlResult.data;
						path = freshPath;
						store.setStoragePath(freshPath);
						store.setStatus("uploading");
						store.updateProgress(10);

						failedStep = "upload";
						logger.info("[useResumeUpload] Uploading file to storage", {
							storagePath: freshPath,
							attempt: retryCount + 1,
						});
						await putFile(signedUrl);
						break;
					} catch (err) {
						const message = err instanceof Error ? err.message : "";
						if (
							message === "Upload cancelled" ||
							retryCount >= 1 ||
							!isTransientUploadFailure(message, failedStatusCode)
						) {
							throw err;
						}
						retryCount += 1;
						failedStatusCode = undefined;
						await new Promise((resolve) => setTimeout(resolve, 800));
						if (!useResumeUploadStore.getState().session) {
							throw new Error("Upload cancelled");
						}
					}
				}

				store.updateProgress(70);

				failedStep = "register";
				if (!skipRegistration && (talentId || userId)) {
					store.setStatus("registering");
					store.updateProgress(75);

					const regResult = await registerUploadedResume({
						storagePath: path,
						fileName: file.name,
						userId: userId || undefined,
						talentId: talentId || undefined,
						uploadSource,
						extractText,
					});

					if (!regResult.ok) {
						failedStatusCode = regResult.error.status;
						throw new Error("Failed to register resume");
					}

					resumeText = regResult.data.resumeText;
					resumeTextError = regResult.data.resumeTextError;
				}
				failedStep = null;

				store.completeUpload(sessionKey);

				capturePostHog(TalentResumeEvents.RESUME_UPLOAD_COMPLETED, {
					file_name: file.name,
					storage_path: path,
					upload_source: uploadSource,
					skip_registration: skipRegistration,
					retry_count: retryCount,
				});

				if (invalidateKeys) {
					for (const key of invalidateKeys) {
						queryClient.invalidateQueries({ queryKey: key });
					}
				}

				onSuccessRef.current?.({ storagePath: path, fileName: file.name, resumeText, resumeTextError });

				return { storagePath: path };
			} catch (err) {
				const message = err instanceof Error ? err.message : "Upload failed";

				if (message === "Upload cancelled") {
					store.reset();
					throw err;
				}

				store.setError(message);
				capturePostHog(TalentResumeEvents.RESUME_UPLOAD_FAILED, {
					error: message,
					upload_source: uploadSource,
					step: failedStep,
					status_code: failedStatusCode,
					file_type: file.type || "unknown",
					file_size: file.size,
					retry_count: retryCount,
				});
				onErrorRef.current?.(message);
				throw err;
			}
		},
		[
			pdfOnly,
			store,
			uploadSource,
			capturePostHog,
			pathPrefix,
			skipRegistration,
			talentId,
			userId,
			sessionKey,
			extractText,
			invalidateKeys,
			queryClient,
		],
	);

	const cancel = useCallback(() => {
		if (xhrRef.current) {
			xhrRef.current.abort();
			xhrRef.current = null;
		}
		store.reset();
	}, [store]);

	const reset = useCallback(() => {
		if (xhrRef.current) {
			xhrRef.current.abort();
			xhrRef.current = null;
		}
		store.reset();
	}, [store]);

	return {
		status,
		progress,
		error,
		storagePath,
		fileName,
		isUploading: status === "getting-url" || status === "uploading" || status === "registering",
		isComplete: status === "complete",
		isOwnSession: session?.uploadSource === uploadSource,
		upload,
		cancel,
		reset,
		persistedUpload,
	};
}
