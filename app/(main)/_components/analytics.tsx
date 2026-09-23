"use client";

import { stripUtmFromBrowserUrl, stripUtmFromUrlString } from "@clera/utm/browser";
import { usePathname, useSearchParams } from "next/navigation";
import { PostHogContext, usePostHog } from "posthog-js/react/slim";
import { type ReactNode, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { config } from "@/config/env";
import { PH_DISTINCT_ID_COOKIE } from "@/lib/posthog-constants";
import { buildPostHogInitOptions } from "@/lib/posthog-init-options";
import { isSeoPublicPath } from "@/utils/internal-routes";
import logger from "@/utils/logger";

type PostHogClient = typeof import("posthog-js").default;

function readDistinctIdCookie(): string | null {
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(new RegExp(`(?:^|; )${PH_DISTINCT_ID_COOKIE}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : null;
}

function DeferredPostHogProvider({ children }: { children: ReactNode }) {
	const [client, setClient] = useState<PostHogClient | null>(null);

	useEffect(() => {
		const posthogKey = config.posthog.key;
		if (!posthogKey || typeof window === "undefined") return;

		let cancelled = false;
		const init = () => {
			import("posthog-js").then(({ default: posthog }) => {
				if (cancelled) return;
				if (!posthog.__loaded) {
					const serverDistinctId = readDistinctIdCookie();
					posthog.init(posthogKey, {
						...buildPostHogInitOptions(window.location.pathname),
						...(serverDistinctId ? { bootstrap: { distinctID: serverDistinctId } } : {}),
						loaded: () => {
							logger.debug("PostHog initialized (deferred for v2 page)");
							const url = window.location.href;
							posthog.capture("$pageview", { $current_url: url });
							stripUtmFromBrowserUrl();
							logger.debug(`PostHog initial pageview captured (v2): ${url}`);
						},
					});
				}
				setClient(posthog);
			});
		};

		const events = ["click", "scroll", "keydown", "touchstart"];
		const handler = () => {
			for (const e of events) {
				window.removeEventListener(e, handler, { capture: true });
			}
			clearTimeout(timeout);
			init();
		};
		for (const e of events) {
			window.addEventListener(e, handler, { once: true, passive: true, capture: true });
		}
		const timeout = isSeoPublicPath(window.location.pathname) ? undefined : setTimeout(handler, 5000);

		return () => {
			cancelled = true;
			for (const e of events) {
				window.removeEventListener(e, handler, { capture: true });
			}
			clearTimeout(timeout);
		};
	}, []);

	const contextValue = useMemo(
		() => ({
			client: (client ?? undefined) as PostHogClient, // v2-precheck-ignore as-cast
			bootstrap: client?.config?.bootstrap,
		}),
		[client],
	);

	return <PostHogContext.Provider value={contextValue}>{children}</PostHogContext.Provider>;
}

function V2PageViewTracker() {
	const posthog = usePostHog();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const lastTracked = useRef<string>(typeof window !== "undefined" ? stripUtmFromUrlString(window.location.href) : "");
	const isInitialMount = useRef(true);

	useEffect(() => {
		if (!pathname || !posthog?.__loaded) return;

		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		let url = window.origin + pathname;
		if (searchParams?.toString()) {
			url = `${url}?${searchParams.toString()}`;
		}

		const normalized = stripUtmFromUrlString(url);
		if (normalized === lastTracked.current) return;

		lastTracked.current = normalized;
		posthog.capture("$pageview", { $current_url: url });
		logger.debug(`PostHog pageview captured (v2): ${url}`);
	}, [pathname, searchParams, posthog]);

	return null;
}

function V2ScrollReset() {
	const pathname = usePathname();

	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname triggers scroll reset on route change
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
}

function V2AnalyticsProvider({ children }: { children: ReactNode }) {
	return (
		<DeferredPostHogProvider>
			<Suspense fallback={null}>
				<V2PageViewTracker />
				<V2ScrollReset />
			</Suspense>
			{children}
		</DeferredPostHogProvider>
	);
}

V2AnalyticsProvider.displayName = "V2AnalyticsProvider";

export { V2AnalyticsProvider };
