export type DateInput = string | number | Date;

export function startOfIsoWeek(d: Date): string {
	const utc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
	const day = utc.getUTCDay();
	utc.setUTCDate(utc.getUTCDate() + (day === 0 ? -6 : 1 - day));
	return utc.toISOString().slice(0, 10);
}

export function parseDate(input: DateInput | null | undefined): Date | null {
	if (input === null || input === undefined) return null;
	if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
	if (typeof input === "number") {
		const parsed = new Date(input > 1e10 ? input : input * 1000);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}
	if (typeof input !== "string") return null;
	const parsed = new Date(input);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}
