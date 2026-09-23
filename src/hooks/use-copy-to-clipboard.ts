"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { copyToClipboard } from "@/utils/clipboard";

interface UseCopyToClipboardOptions {
	successMessage: string;
	errorMessage?: string;
}

export function useCopyToClipboard({ successMessage, errorMessage }: UseCopyToClipboardOptions) {
	const [copied, setCopied] = useState(false);

	const copy = useCallback(
		async (text: string | null) => {
			if (!text) {
				if (errorMessage) toast.error(errorMessage);
				return;
			}
			try {
				await copyToClipboard(text);
				toast.success(successMessage);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch {
				toast.error("Failed to copy");
			}
		},
		[successMessage, errorMessage],
	);

	return { copied, copy };
}
