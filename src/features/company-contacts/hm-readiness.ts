import { getFullName } from "@clera/shared-utils";
import type { ContactOption } from "@/services/api/company-contacts";
import type { CompanyContact } from "@/types/company-contact";

type HmContact = Pick<CompanyContact, "id" | "calendarLink" | "isPrimary" | "createdAt">;

interface RoleIntroReadiness {
	ready: boolean;
	reason?: "no_hm" | "hm_no_link";
	hmName?: string;
	hmContactId?: string;
}

function resolveEffectiveHmContact<T extends HmContact>(contacts: T[], companyContactId: string | null): T | null {
	const assigned = companyContactId ? contacts.find((contact) => contact.id === companyContactId) : undefined;
	if (assigned) return assigned;
	const primary = contacts.find((contact) => contact.isPrimary);
	if (primary) return primary;
	return [...contacts].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0] ?? null;
}

function roleHasBookableHm(contacts: HmContact[], companyContactId: string | null): boolean {
	return !!resolveEffectiveHmContact(contacts, companyContactId)?.calendarLink;
}

function resolveRoleIntroReadiness(contacts: ContactOption[], companyContactId: string | null): RoleIntroReadiness {
	const effective = resolveEffectiveHmContact(contacts, companyContactId);
	if (effective?.calendarLink) return { ready: true };
	const assigned = companyContactId ? contacts.find((contact) => contact.id === companyContactId) : undefined;
	if (!assigned) return { ready: false, reason: "no_hm" };
	return {
		ready: false,
		reason: "hm_no_link",
		hmName: getFullName({ first_name: assigned.firstName, last_name: assigned.lastName }, assigned.email),
		hmContactId: assigned.id,
	};
}

function hasSchedulingLinkContact(
	contacts: Pick<CompanyContact, "id" | "calendarLink">[],
	excludeId?: string,
): boolean {
	return contacts.some((contact) => contact.id !== excludeId && !!contact.calendarLink);
}

export type { RoleIntroReadiness };
export { hasSchedulingLinkContact, resolveEffectiveHmContact, resolveRoleIntroReadiness, roleHasBookableHm };
