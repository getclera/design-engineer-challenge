export function isBlank(value: unknown): boolean {
	if (value === null || value === undefined) return true;
	if (typeof value === "string") return value.trim().length === 0;
	if (Array.isArray(value)) return value.length === 0;
	return false;
}

export function isNullishSentinel(value: unknown): boolean {
	if (value === null || value === undefined) return true;
	const normalized = String(value).trim().toLowerCase();
	return normalized === "" || normalized === "null";
}

export function cleanSentinelField(value: string | null | undefined): string | null {
	if (value === null || value === undefined) return null;
	const parts = String(value)
		.split(",")
		.map((part) => part.trim())
		.filter((part) => part !== "" && part.toLowerCase() !== "null" && part.toLowerCase() !== "undefined");
	return parts.length === 0 ? null : parts.join(", ");
}
