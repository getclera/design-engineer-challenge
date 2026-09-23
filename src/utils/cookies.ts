export function getCookie(name: string): string | null {
	if (typeof document === "undefined") return null;
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		return parts.pop()?.split(";").shift() || null;
	}
	return null;
}

export function setCookie(
	name: string,
	value: string,
	days?: number,
	options?: { path?: string; secure?: boolean; sameSite?: "strict" | "lax" | "none"; maxAgeSeconds?: number },
) {
	if (typeof document === "undefined") return;

	const path = options?.path || "/";
	const secure = options?.secure || false;
	const sameSite = options?.sameSite || "lax";

	let cookieString = `${name}=${value}; path=${path}`;

	if (options?.maxAgeSeconds !== undefined) {
		cookieString += `; max-age=${options.maxAgeSeconds}`;
	} else if (days) {
		const expires = new Date();
		expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
		cookieString += `; expires=${expires.toUTCString()}`;
	}

	if (secure) {
		cookieString += "; secure";
	}

	cookieString += `; sameSite=${sameSite}`;

	document.cookie = cookieString;
}

export function deleteCookie(name: string, options?: { path?: string }) {
	if (typeof document === "undefined") return;
	const path = options?.path || "/";
	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}
