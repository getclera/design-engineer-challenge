import type { schema } from "@/lib/db/drizzle";

export type CompanyContact = typeof schema.companyContactsInCommunication.$inferSelect;

export type CompanyContactFormData = Pick<
	CompanyContact,
	"firstName" | "lastName" | "email" | "phone" | "linkedinUrl" | "title" | "calendarLink" | "isPrimary" | "shouldCc"
>;
