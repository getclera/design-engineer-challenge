import { z } from "zod";

export const strictEmail = z.string().trim().toLowerCase().pipe(z.string().email());

export const strictEmailNullable = strictEmail.nullable();

export const strictEmailOptional = strictEmail.optional();

export const strictEmailNullish = strictEmail.nullish();

export function isStrictEmail(value: unknown): value is string {
	return strictEmail.safeParse(value).success;
}

export function normalizeEmailOrEmpty(value: string | undefined | null): string {
	if (!value) return "";
	const parsed = strictEmail.safeParse(value);
	return parsed.success ? parsed.data : "";
}
