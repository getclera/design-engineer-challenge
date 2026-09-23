export const CLERA_ORIGIN = "https://www.getclera.com";

export const CLERA_HOST = new URL(CLERA_ORIGIN).host;

export function absoluteUrl(path: string): string {
	return `${CLERA_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
