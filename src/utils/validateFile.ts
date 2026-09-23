import { MAX_RESUME_FILE_SIZE, resumeFileSizeError } from "@/utils/fileConstants";

const ALLOWED_TYPES_ALL = [
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.apple.pages",
	"application/x-iwork-pages-sffpages",
];

const ALLOWED_EXTENSIONS_ALL = /\.(pdf|doc|docx|pages)$/i;
const ALLOWED_EXTENSIONS_PDF = /\.pdf$/i;

export function validateFile(file: File, pdfOnly: boolean): { valid: boolean; error?: string } {
	const allowedTypes = pdfOnly ? ["application/pdf"] : ALLOWED_TYPES_ALL;
	const allowedExtensions = pdfOnly ? ALLOWED_EXTENSIONS_PDF : ALLOWED_EXTENSIONS_ALL;

	const isValidType = allowedTypes.some((type) => file.type === type) || allowedExtensions.test(file.name);
	if (!isValidType) {
		const typeLabel = pdfOnly
			? "Only PDF documents are supported"
			: "Only PDF, Word, and Pages documents are supported";
		return { valid: false, error: typeLabel };
	}
	if (file.size > MAX_RESUME_FILE_SIZE) {
		return { valid: false, error: resumeFileSizeError() };
	}
	return { valid: true };
}
