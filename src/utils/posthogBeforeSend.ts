import type { BeforeSendFn, CaptureResult } from "posthog-js";

const IGNORED_EXCEPTION_MESSAGES: RegExp[] = [
	/^ResizeObserver loop /,
	/^WKWebView API client did not respond to this postMessage$/,
	/(?:The (?:user|operation) (?:aborted|was aborted)|Fetch is aborted)/i,
	/^AbortError: AbortError$/,
	/^Script error\.?$/,
	/Blocked a frame with origin/,
	/^(?:TypeError: )?Failed to fetch$/,
	/^(?:TypeError: )?Load failed$/,
	/NetworkError when attempting to fetch resource/i,
];

interface ExceptionListItem {
	type?: unknown;
	value?: unknown;
}

function getExceptionMessages(properties: CaptureResult["properties"]): string[] {
	const messages: string[] = [];
	const list = properties.$exception_list;
	if (Array.isArray(list)) {
		for (const item of list as ExceptionListItem[]) {
			if (item && typeof item.value === "string") {
				messages.push(item.value);
			}
			if (item && typeof item.type === "string") {
				messages.push(item.type);
			}
		}
	}
	const fallback = properties.$exception_message;
	if (typeof fallback === "string") {
		messages.push(fallback);
	}
	return messages;
}

export const beforeSendFilter: BeforeSendFn = (event) => {
	if (!event || event.event !== "$exception") {
		return event;
	}
	const messages = getExceptionMessages(event.properties);
	for (const message of messages) {
		for (const pattern of IGNORED_EXCEPTION_MESSAGES) {
			if (pattern.test(message)) {
				return null;
			}
		}
	}
	return event;
};
