import { orgRoutes } from "@clera/route-factory";
import { redirect } from "next/navigation";

export default async function SettingsIndex({ params }: { params: Promise<{ orgId: string }> }) {
	redirect(orgRoutes.settings.company((await params).orgId));
}
