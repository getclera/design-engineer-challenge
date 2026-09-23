"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { config } from "@/config/env";
import { buildPostHogInitOptions } from "@/lib/posthog-init-options";
import logger from "@/utils/logger";

type PostHogInstance = typeof import("posthog-js").default;

let posthogInstance: PostHogInstance | null = null;
let loadingPromise: Promise<PostHogInstance | null> | null = null;

async function loadPostHog(): Promise<PostHogInstance | null> {
	if (posthogInstance) return posthogInstance;
	if (loadingPromise) return loadingPromise;

	const posthogKey = config.posthog.key;
	if (!posthogKey) {
		logger.debug("PostHog key not configured, skipping initialization");
		return null;
	}

	loadingPromise = (async () => {
		try {
			const posthogModule = await import("posthog-js");
			const posthog = posthogModule.default;

			if (!posthog.__loaded) {
				posthog.init(posthogKey, {
					...buildPostHogInitOptions(window.location.pathname),
					loaded: () => {
						logger.debug("PostHog initialized (lazy hook)");
					},
				});
			}

			posthogInstance = posthog;
			return posthog;
		} catch (error) {
			loadingPromise = null;
			logger.warn("Failed to load PostHog", { error });
			return null;
		}
	})();

	return loadingPromise;
}

interface LazyPostHogResult {
	capture: (eventName: string, properties?: Record<string, unknown>) => void;

	isLoaded: boolean;

	getFeatureFlag: (flagName: string) => string | boolean | undefined;

	identify: (distinctId: string, properties?: Record<string, unknown>) => void;

	reset: () => void;
}

export function useLazyPostHog(): LazyPostHogResult {
	const [isLoaded, setIsLoaded] = useState(() => posthogInstance?.__loaded ?? false);
	const pendingEvents = useRef<Array<{ name: string; properties?: Record<string, unknown> }>>([]);

	useEffect(() => {
		if (posthogInstance?.__loaded) {
			setIsLoaded(true);
			const eventsToFlush = pendingEvents.current;
			pendingEvents.current = [];
			for (const event of eventsToFlush) {
				posthogInstance.capture(event.name, event.properties);
			}
		}
	}, []);

	const capture = useCallback((eventName: string, properties?: Record<string, unknown>) => {
		if (posthogInstance?.__loaded) {
			posthogInstance.capture(eventName, properties);
		} else {
			pendingEvents.current.push({ name: eventName, properties });
			loadPostHog()
				.then((ph) => {
					if (ph) {
						setIsLoaded(true);
						const eventsToFlush = pendingEvents.current;
						pendingEvents.current = [];
						for (const event of eventsToFlush) {
							ph.capture(event.name, event.properties);
						}
					}
				})
				.catch((error) => {
					logger.warn("Failed to load PostHog for capture", { error, eventName });
				});
		}
	}, []);

	const getFeatureFlag = useCallback((flagName: string): string | boolean | undefined => {
		if (!posthogInstance?.__loaded) return undefined;
		return posthogInstance.getFeatureFlag(flagName);
	}, []);

	const identify = useCallback((distinctId: string, properties?: Record<string, unknown>) => {
		if (posthogInstance?.__loaded) {
			posthogInstance.identify(distinctId, properties);
		} else {
			loadPostHog()
				.then((ph) => {
					if (ph) {
						setIsLoaded(true);
						ph.identify(distinctId, properties);
					}
				})
				.catch((error) => {
					logger.warn("Failed to load PostHog for identify", { error, distinctId });
				});
		}
	}, []);

	const reset = useCallback(() => {
		if (posthogInstance?.__loaded) {
			posthogInstance.reset();
		}
	}, []);

	return {
		capture,
		isLoaded,
		getFeatureFlag,
		identify,
		reset,
	};
}
