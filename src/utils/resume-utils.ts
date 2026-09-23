import type { Candidate } from "@/types/talent";
import logger from "@/utils/logger";

export const handleDownloadResume = async ({
	documentUrl,
	candidate,
}: {
	documentUrl: string;
	candidate: Pick<Candidate, "firstname" | "lastname">;
}) => {
	if (!documentUrl) return;

	try {
		const response = await fetch(documentUrl);
		const blob = await response.blob();
		const url = globalThis.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;

		const firstName = candidate?.firstname || "candidate";
		const lastName = candidate?.lastname || "";
		const filename = lastName ? `${firstName}_${lastName}_Resume.pdf` : `${firstName}_Resume.pdf`;

		link.download = filename;

		document.body.appendChild(link);
		link.click();
		link.remove();
		globalThis.URL.revokeObjectURL(url);
	} catch {
		// Silently handle download errors
	}
};

export const handleDownloadSampleResumeTemplate = async () => {
	const templateUrl = "https://app.getclera.com/storage/v1/object/public/templates/clera_resume_template_download.docx";

	try {
		const response = await fetch(templateUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch template: ${response.statusText}`);
		}

		const blob = await response.blob();
		const url = globalThis.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "Clera_Resume_Template.docx";

		document.body.appendChild(link);
		link.click();
		link.remove();
		globalThis.URL.revokeObjectURL(url);
	} catch (error) {
		logger.error("Error downloading sample resume template:", error);
		throw error;
	}
};
