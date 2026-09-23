const RELOAD_FLAG = "clera:chunk-reload-attempt";
const RELOAD_WINDOW_MS = 30_000;

const CHUNK_ERROR_PATTERNS = [
	"Loading chunk",
	"Loading CSS chunk",
	"Failed to load chunk",
	"Failed to fetch dynamically imported module",
	"Importing a module script failed",
	"error loading dynamically imported module",
] as const;

const STALE_STREAM_PATTERNS = [
	"Connection closed",
	"Failed to fetch RSC payload",
	"Failed to find Server Action",
] as const;

function isChunkLoadError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	if (error.name === "ChunkLoadError") return true;
	const message = error.message ?? "";
	return CHUNK_ERROR_PATTERNS.some((p) => message.includes(p));
}

function isStaleStreamError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	const message = error.message ?? "";
	return STALE_STREAM_PATTERNS.some((p) => message.includes(p));
}

function isStaleDeploymentError(error: unknown): boolean {
	return isChunkLoadError(error) || isStaleStreamError(error);
}

function shouldReload(): boolean {
	if (typeof window === "undefined") return false;
	try {
		const previous = window.sessionStorage.getItem(RELOAD_FLAG);
		if (!previous) return true;
		const previousTs = Number(previous);
		if (!Number.isFinite(previousTs)) return true;
		return Date.now() - previousTs > RELOAD_WINDOW_MS;
	} catch {
		return false;
	}
}

function tryRecoverFromStaleDeployment(error: unknown): boolean {
	if (typeof window === "undefined") return false;
	if (!isStaleDeploymentError(error)) return false;
	if (!shouldReload()) return false;
	try {
		window.sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
	} catch {
		return false;
	}
	window.location.reload();
	return true;
}

export { isStaleDeploymentError, shouldReload, tryRecoverFromStaleDeployment };
