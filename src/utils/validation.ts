import { strictEmail } from "@clera/shared-types/email-schema";

export function isValidEmail(email: string): boolean {
	return strictEmail.safeParse(email).success;
}
