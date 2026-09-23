"use client";

import { Skeleton } from "@v2/components/ui/skeleton";
import dynamic from "next/dynamic";

export const DynamicPdfViewer = dynamic(() => import("./pdf-viewer"), {
	ssr: false,
	loading: () => <Skeleton className="h-full min-h-50 w-full" />,
});
