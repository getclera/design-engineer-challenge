export const MAX_MULTIPART_UPLOAD_MB = 4;

export const MAX_MULTIPART_UPLOAD_BYTES = MAX_MULTIPART_UPLOAD_MB * 1024 * 1024;

export const MAX_FILE_SIZE = MAX_MULTIPART_UPLOAD_BYTES;

export const MAX_FILE_SIZE_MB = MAX_MULTIPART_UPLOAD_MB;

export const MAX_RESUME_FILE_SIZE_MB = 5;

export const MAX_RESUME_FILE_SIZE = MAX_RESUME_FILE_SIZE_MB * 1024 * 1024;

export const IMAGE_SIZE_ERROR = `Image must be ${MAX_FILE_SIZE_MB} MB or smaller.`;

export function fileSizeError(maxMb: number): string {
	return `File size must be under ${maxMb}MB`;
}

export function resumeFileSizeError(): string {
	return fileSizeError(MAX_RESUME_FILE_SIZE_MB);
}

export const PDF_ACCEPT = ".pdf,application/pdf";

export const ALLOWED_AVATAR_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"] as const;

const ALLOWED_AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;

export const ALLOWED_AVATAR_MIME_TYPES_SET = new Set<string>(ALLOWED_AVATAR_MIME_TYPES);

export const AVATAR_ACCEPT = `${ALLOWED_AVATAR_MIME_TYPES.join(",")},.jpg,.jpeg,.png,.gif,.webp`;
