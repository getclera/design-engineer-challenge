import { isProduction } from "@/config/env";

type SentryModule = typeof import("@sentry/nextjs");

const shouldUseSentry = isProduction || process.env.NEXT_PUBLIC_ENABLE_SENTRY_IN_DEV === "true";

const IGNORED_ERROR_PATTERNS = [
	/Failed to load Clerk JS/,
	/Clerk failed to load within \d+s/,
	/^Failed to fetch \((ad\.doubleclick\.net|px\.ads\.linkedin\.com|www\.googleadservices\.com)\)$/,
	/Failed to connect to MetaMask/,
	/window\.__firefox__/,
	/Could not establish connection\. Receiving end does not exist\./,
	/reading 'M_ID'/,
];

const DENIED_URL_PATTERNS = [
	/\/executors\/\d+\.js/,
	/^chrome-extension:\/\//,
	/^moz-extension:\/\//,
	/^safari-(web-)?extension:\/\//,
	/ad\.doubleclick\.net/,
	/px\.ads\.linkedin\.com/,
	/googleadservices\.com/,
];

let sentryReady: Promise<SentryModule> | null = null;

function getSentry(): Promise<SentryModule> {
	if (!sentryReady) {
		sentryReady = (async () => {
			const Sentry = await import("@sentry/nextjs");
			if (typeof window !== "undefined") {
				Sentry.init({
					dsn: "https://431cb953b79d67955f90a8feb3d7bc51@o4508868499668992.ingest.de.sentry.io/4510711758389328",
					integrations: [Sentry.replayIntegration()],
					tracesSampleRate: isProduction ? 1 : 0.1,
					enableLogs: true,
					replaysSessionSampleRate: isProduction ? 0.1 : 0,
					replaysOnErrorSampleRate: 1.0,
					sendDefaultPii: true,
					ignoreErrors: IGNORED_ERROR_PATTERNS,
					denyUrls: DENIED_URL_PATTERNS,
					beforeSend(event) {
						const message = event.exception?.values?.[0]?.value ?? "";
						if (message === "Failed to fetch" || message === "TypeError: Failed to fetch") {
							return null;
						}
						if (message.includes("Object Not Found Matching Id:")) {
							return null;
						}
						return event;
					},
				});
			}
			return Sentry;
		})();
	}
	return sentryReady;
}

function initSentry(): void {
	if (!shouldUseSentry) return;
	void getSentry();
}

function captureException(error: unknown, options?: { extra?: Record<string, unknown> }): void {
	if (!shouldUseSentry) return;
	void getSentry().then((Sentry) => {
		Sentry.captureException(error, options);
	});
}

function captureMessage(
	message: string,
	options?: {
		level?: "fatal" | "error" | "warning" | "info" | "debug";
		extra?: Record<string, unknown>;
	},
): void {
	if (!shouldUseSentry) return;
	void getSentry().then((Sentry) => {
		Sentry.captureMessage(message, options);
	});
}

export { captureException, captureMessage, initSentry, shouldUseSentry };
