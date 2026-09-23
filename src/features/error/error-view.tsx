"use client";

import { marketingRoutes } from "@clera/route-factory";
import { Warning } from "@phosphor-icons/react/ssr";
import { Button } from "@v2/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SUPPORT_EMAIL } from "@/config/constants";
import { isStaleDeploymentError, shouldReload, tryRecoverFromStaleDeployment } from "@/utils/chunk-load-error";
import logger from "@/utils/logger";

const isDevelopment = process.env.NODE_ENV === "development";

interface ErrorViewProps {
	error: Error & { digest?: string };
	reset: () => void;
	showDetails?: boolean;
}

// Next requires error.tsx to be a Client Component, so everything rendered here ships as client JS
// on every route. Importing @v2/components/layout put a second, client-side copy of Navbar/Footer/
// PageShell into all 29 marketing bundles (31.5 KB gzip) - the page's own chrome is server-rendered
// and free. Keep this screen self-contained: it also renders on stale-deployment chunk-load
// failures, where pulling extra chunks is what breaks.
function ErrorView({ error, reset, showDetails = false }: ErrorViewProps) {
	const [reloading, setReloading] = useState<boolean>(() => isStaleDeploymentError(error) && shouldReload());

	useEffect(() => {
		if (tryRecoverFromStaleDeployment(error)) {
			setReloading(true);
			return;
		}
		setReloading(false);
		logger.error("Application error:", { message: error.message, digest: error.digest });
		void import("@sentry/nextjs")
			.then((Sentry) => {
				const eventId = Sentry.captureException(error);
				logger.info("[ErrorView] Captured to Sentry", { eventId, digest: error.digest });
			})
			.catch((cause) => {
				logger.error("[ErrorView] Could not load Sentry to report the error", {
					digest: error.digest,
					cause: cause instanceof Error ? cause.message : String(cause),
				});
			});
	}, [error]);

	if (reloading) {
		return <div data-v2 className="min-h-dvh bg-v2-bg-page text-v2-text-body font-v2-body antialiased" />;
	}

	return (
		<div data-v2 className="min-h-dvh bg-v2-bg-page text-v2-text-body font-v2-body antialiased">
			<main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
				<div role="alert">
					<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-v2-brand-teal/10">
						<Warning className="size-8 text-v2-text-brand" />
					</div>

					<h1 className="mt-6 font-v2-heading text-3xl font-medium text-v2-text-primary md:text-4xl">
						Something Went Wrong
					</h1>
					<p className="mt-3 font-v2-body text-base font-light text-v2-text-muted">
						An unexpected error occurred. Our team has been notified and is working to resolve this.
					</p>
				</div>

				{(isDevelopment || showDetails) && (
					<div className="mt-6 w-full max-w-lg rounded-v2-md border border-v2-border-warm bg-v2-bg-card p-4 text-left">
						<p className="font-v2-body text-xs font-medium uppercase tracking-wider text-v2-text-muted">
							Error Details
						</p>
						<pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-sm text-v2-text-primary">
							{error.stack ?? error.message}
						</pre>
						{error.digest && <p className="mt-2 font-mono text-xs text-v2-text-muted">Digest: {error.digest}</p>}
					</div>
				)}

				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Button variant="primary" onClick={reset}>
						Try Again
					</Button>
					<Button variant="ghost" asChild>
						<Link href={marketingRoutes.home}>Go Home</Link>
					</Button>
				</div>

				<p className="mt-10 font-v2-body text-sm font-light text-v2-text-muted">
					If this problem persists, please contact{" "}
					<a href={`mailto:${SUPPORT_EMAIL}`} className="font-normal text-v2-text-brand hover:underline">
						{SUPPORT_EMAIL}
					</a>
				</p>
			</main>
		</div>
	);
}
ErrorView.displayName = "ErrorView";

export { ErrorView };
