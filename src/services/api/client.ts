import { AuthExpiredError } from "@v2/lib/auth/auth-expired-error";

type ApiErrorType = "NETWORK" | "VALIDATION" | "AUTH" | "SERVER" | "UNKNOWN";

function isAbortError(e: unknown): boolean {
	if (e instanceof Error && e.name === "AbortError") return true;
	return typeof DOMException !== "undefined" && e instanceof DOMException && e.name === "AbortError";
}

async function safeJsonParse(response: Response): Promise<Record<string, unknown> | null> {
	try {
		return await response.json();
	} catch {
		return null;
	}
}

interface ApiError {
	type: ApiErrorType;
	message: string;
	status: number;
	path: string;
	details?: unknown;
	code?: string;
	requestId?: string;
}

function readErrorParts(data: Record<string, unknown> | null): {
	message?: string;
	code?: string;
	requestId?: string;
} {
	const requestId = typeof data?.request_id === "string" ? data.request_id : undefined;
	const err = data?.error;
	if (typeof err === "string") return { message: err, requestId };
	if (err && typeof err === "object") {
		const { message, code } = err as { message?: string; code?: string };
		return { message, code, requestId };
	}
	return { requestId };
}

export type ApiResult<T, E = ApiError> = { ok: true; data: T; error: null } | { ok: false; data: null; error: E };

const UUID_SEGMENT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NUMERIC_SEGMENT = /^\d+$/;
const ROUTE_NAME_SEGMENT = /^[a-z][a-z0-9-]*$/;
const NANO_ID_SEGMENT = /^(?=.*\d)[a-z0-9]{12}$/;
const OPAQUE_ID_SEGMENT = /^[A-Za-z0-9_-]{8,}$/;
const SEGMENTS_ALWAYS_FOLLOWED_BY_AN_ID = new Set(["slug", "by-slug"]);

function isIdentifierSegment(segment: string, previousSegment: string | undefined): boolean {
	if (UUID_SEGMENT.test(segment) || NUMERIC_SEGMENT.test(segment)) return true;
	if (previousSegment !== undefined && SEGMENTS_ALWAYS_FOLLOWED_BY_AN_ID.has(previousSegment)) return true;
	if (NANO_ID_SEGMENT.test(segment)) return true;
	if (ROUTE_NAME_SEGMENT.test(segment)) return false;
	return OPAQUE_ID_SEGMENT.test(segment);
}

function fingerprintPath(path: string): string {
	const [pathname] = path.split("?");
	const segments = pathname.split("/");
	return segments
		.map((segment, index) => (isIdentifierSegment(segment, segments[index - 1]) ? ":id" : segment))
		.join("/");
}

export class ApiRequestError extends Error {
	readonly type: ApiErrorType;
	readonly status: number;
	readonly path: string;
	readonly code?: string;
	readonly requestId?: string;
	readonly details?: unknown;

	constructor(error: ApiError) {
		super(error.message);
		this.name = `ApiError ${error.status} ${fingerprintPath(error.path)}`;
		this.type = error.type;
		this.status = error.status;
		this.path = error.path;
		this.code = error.code;
		this.requestId = error.requestId;
		this.details = error.details;
	}
}

function toThrowable(error: ApiError): Error {
	if (error.type === "AUTH") return new AuthExpiredError();
	return new ApiRequestError(error);
}

export function unwrap<T>(result: ApiResult<T>): T {
	if (!result.ok) throw toThrowable(result.error);
	return result.data;
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === "") continue;
		search.set(key, String(value));
	}
	return search.toString();
}

interface RequestOptions {
	unwrapData: boolean;
	failVerb: "Request" | "Upload";
}

function errorTypeForStatus(status: number): ApiErrorType {
	if (status === 401) return "AUTH";
	if (status === 400 || status === 422) return "VALIDATION";
	if (status >= 500) return "SERVER";
	return "UNKNOWN";
}

function toApiResult<T>(
	response: Response,
	data: Record<string, unknown> | null,
	path: string,
	{ unwrapData, failVerb }: RequestOptions,
): ApiResult<T> {
	if (!response.ok) {
		const errorParts = readErrorParts(data);
		return {
			ok: false,
			data: null,
			error: {
				type: errorTypeForStatus(response.status),
				message: errorParts.message || `${failVerb} failed with status ${response.status}`,
				status: response.status,
				path,
				details: data?.details,
				code: errorParts.code,
				requestId: errorParts.requestId,
			},
		};
	}

	if (!data) {
		return {
			ok: false,
			data: null,
			error: { type: "SERVER", message: "Invalid response format from server", status: response.status, path },
		};
	}

	if (!unwrapData) return { ok: true, data: data as T, error: null };

	if ("success" in data && data.success === false) {
		const errorParts = readErrorParts(data);
		return {
			ok: false,
			data: null,
			error: {
				type: "VALIDATION",
				message: errorParts.message || `${failVerb} was unsuccessful`,
				status: response.status,
				path,
				details: data,
				code: errorParts.code,
				requestId: errorParts.requestId,
			},
		};
	}

	const responseData = "data" in data && !("has_more" in data) ? data.data : data;
	return { ok: true, data: responseData as T, error: null };
}

async function request<T>(path: string, init: RequestInit, options: RequestOptions): Promise<ApiResult<T>> {
	try {
		const response = await fetch(path, init);
		const data = await safeJsonParse(response);
		return toApiResult<T>(response, data, path, options);
	} catch (error) {
		if (isAbortError(error)) throw error;
		return {
			ok: false,
			data: null,
			error: {
				type: "NETWORK",
				message: error instanceof Error ? error.message : "Network error occurred",
				status: 0,
				path,
				details: error,
			},
		};
	}
}

const JSON_REQUEST: RequestOptions = { unwrapData: true, failVerb: "Request" };

export function callApi<TResponse, TRequest = unknown>(
	path: string,
	body: TRequest,
	options?: { method?: string; headers?: Record<string, string>; keepalive?: boolean },
): Promise<ApiResult<TResponse>> {
	return request<TResponse>(
		path,
		{
			method: options?.method || "POST",
			keepalive: options?.keepalive,
			headers: { "Content-Type": "application/json", ...options?.headers },
			body: JSON.stringify(body),
		},
		JSON_REQUEST,
	);
}

export function fetchApi<TResponse>(
	path: string,
	options?: { method?: string; body?: string; headers?: Record<string, string> },
): Promise<ApiResult<TResponse>> {
	return request<TResponse>(
		path,
		{
			method: options?.method || "GET",
			headers: { "Content-Type": "application/json", ...options?.headers },
			...(options?.body && { body: options.body }),
		},
		JSON_REQUEST,
	);
}

export function callServiceApi<TResponse, TRequest = unknown>(
	path: string,
	body: TRequest,
	options?: { method?: string; headers?: Record<string, string> },
): Promise<ApiResult<TResponse>> {
	return request<TResponse>(
		path,
		{
			method: options?.method || "POST",
			headers: { "Content-Type": "application/json", ...options?.headers },
			body: JSON.stringify(body),
		},
		{ unwrapData: false, failVerb: "Request" },
	);
}

export function uploadFile<TResponse>(path: string, formData: FormData): Promise<ApiResult<TResponse>> {
	return request<TResponse>(path, { method: "POST", body: formData }, { unwrapData: true, failVerb: "Upload" });
}

export interface FileDownload {
	blob: Blob;
	filename: string;
}

export async function exportFile(
	path: string,
	init?: RequestInit,
	fallbackFilename = "export.csv",
): Promise<ApiResult<FileDownload>> {
	try {
		const res = await fetch(path, init);
		if (!res.ok) {
			return { ok: false, data: null, error: { type: "SERVER", message: "Export failed", status: res.status, path } };
		}
		const blob = await res.blob();
		const filename = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ?? fallbackFilename;
		return { ok: true, data: { blob, filename }, error: null };
	} catch (error) {
		if (isAbortError(error)) throw error;
		return {
			ok: false,
			data: null,
			error: { type: "NETWORK", message: error instanceof Error ? error.message : "Export failed", status: 0, path },
		};
	}
}
