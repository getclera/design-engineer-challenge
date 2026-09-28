import { orgRoutes } from "@clera/route-factory";
import { redirect } from "next/navigation";
import { ROLES } from "@mock/roles";

/** Contacts now live in Settings › Team. Old links (Review's hiring-manager warning) land on that person's row. */
export default async function ContactsRedirect({
	params,
	searchParams,
}: {
	params: Promise<{ orgId: string }>;
	searchParams: Promise<{ highlight?: string }>;
}) {
	const { orgId } = await params;
	const { highlight } = await searchParams;
	const role = highlight ? ROLES.find((r) => r.status === "active" && r.companyContactId === highlight) : undefined;
	redirect(`${orgRoutes.settings.members(orgId)}?focus=calendar${role ? `&role=${role.id}` : ""}`);
}
