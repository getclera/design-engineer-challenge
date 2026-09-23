import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { talentKeys } from "@/lib/query-keys";

const GC_TIME = 45 * 60 * 1000;

async function fetchPdfObjectUrl(url: string) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Resume preload failed with status ${res.status}`);
	return URL.createObjectURL(await res.blob());
}

export function useResumePreload(
	talentId: string,
	signedUrl: string | undefined,
	orgId?: string,
	resumeId?: string | null,
) {
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!signedUrl) return;
		void import("@v2/components/ui/pdf-viewer");
	}, [signedUrl]);

	useEffect(() => {
		return queryClient.getQueryCache().subscribe((event) => {
			if (event.type !== "removed") return;
			if (!event.query.queryKey.includes("resume-blob")) return;
			const url = event.query.state.data;
			if (typeof url === "string") URL.revokeObjectURL(url);
		});
	}, [queryClient]);

	const { data } = useQuery({
		queryKey: talentKeys.resumeBlob(talentId, orgId, resumeId ?? undefined),
		queryFn: () => fetchPdfObjectUrl(signedUrl ?? ""),
		enabled: !!signedUrl,
		staleTime: Number.POSITIVE_INFINITY,
		gcTime: GC_TIME,
		retry: 1,
	});
	return data;
}
