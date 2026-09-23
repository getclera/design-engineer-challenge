import { DeferredToaster } from "@v2/components/ui/deferred-toaster";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { V2AnalyticsProvider } from "./_components/analytics";
import { V2QueryProvider } from "./_components/query-provider";

export const metadata: Metadata = {
	title: "Clera",
};

export default function V2Layout({ children }: { children: ReactNode }) {
	return (
		<>
			<style>{"html, body { background-color: var(--v2-bg-page, #fbf8f4) !important; }"}</style>
			<div data-v2 className="min-h-dvh overflow-x-clip bg-v2-bg-page text-v2-text-body font-v2-body antialiased">
				<V2QueryProvider>
					<V2AnalyticsProvider>{children}</V2AnalyticsProvider>
					<DeferredToaster />
				</V2QueryProvider>
			</div>
		</>
	);
}
