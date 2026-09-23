import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type UploadStatus = "idle" | "getting-url" | "uploading" | "registering" | "complete" | "error";

export interface UploadSession {
	status: UploadStatus;
	fileName: string;
	fileSize: number;
	progress: number;
	storagePath: string | null;
	error: string | null;
	uploadSource: string;
}

export interface PersistedUpload {
	storagePath: string;
	fileName: string;
	completedAt: number;
}

interface ResumeUploadState {
	session: UploadSession | null;
	completedUploads: Record<string, PersistedUpload>;

	startUpload: (fileName: string, fileSize: number, uploadSource: string) => void;
	setStatus: (status: UploadStatus) => void;
	updateProgress: (progress: number) => void;
	setStoragePath: (storagePath: string) => void;
	completeUpload: (sessionKey?: string) => void;
	setError: (error: string) => void;
	getPersistedUpload: (sessionKey: string) => PersistedUpload | null;
	clearPersistedUpload: (sessionKey: string) => void;
	reset: () => void;
}

export const useResumeUploadStore = create<ResumeUploadState>()(
	persist(
		(set, get) => ({
			session: null,
			completedUploads: {},

			startUpload: (fileName, fileSize, uploadSource) => {
				set({
					session: {
						status: "getting-url",
						fileName,
						fileSize,
						progress: 0,
						storagePath: null,
						error: null,
						uploadSource,
					},
				});
			},

			setStatus: (status) => {
				const { session } = get();
				if (!session) return;
				set({ session: { ...session, status } });
			},

			updateProgress: (progress) => {
				const { session } = get();
				if (!session) return;
				set({ session: { ...session, progress } });
			},

			setStoragePath: (storagePath) => {
				const { session } = get();
				if (!session) return;
				set({ session: { ...session, storagePath } });
			},

			completeUpload: (sessionKey) => {
				const { session, completedUploads } = get();
				if (!session?.storagePath) return;

				const updates: Partial<ResumeUploadState> = {
					session: { ...session, status: "complete", progress: 100 },
				};

				if (sessionKey) {
					updates.completedUploads = {
						...completedUploads,
						[sessionKey]: {
							storagePath: session.storagePath,
							fileName: session.fileName,
							completedAt: Date.now(),
						},
					};
				}

				set(updates);
			},

			setError: (error) => {
				const { session } = get();
				set({
					session: session ? { ...session, status: "error", error } : null,
				});
			},

			getPersistedUpload: (sessionKey) => {
				return get().completedUploads[sessionKey] ?? null;
			},

			clearPersistedUpload: (sessionKey) => {
				const { completedUploads } = get();
				const rest = Object.fromEntries(Object.entries(completedUploads).filter(([k]) => k !== sessionKey));
				set({ completedUploads: rest });
			},

			reset: () => {
				set({ session: null });
			},
		}),
		{
			name: "resume-upload-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				completedUploads: state.completedUploads,
			}),
		},
	),
);
