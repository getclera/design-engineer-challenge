import { orgRoutes } from "@clera/route-factory";
import { CompassIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@v2/components/ui/button";
import Link from "next/link";

/** Pages outside the case (Pipeline, Roles, Integrations…) land here instead of a 404. */
export default async function OutsideTheCase({ params }: { params: Promise<{ orgId: string }> }) {
	const { orgId } = await params;
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-14 text-center">
			<CompassIcon size={28} weight="light" className="mb-4 text-v2-text-tertiary" />
			<h1 className="font-v2-heading text-lg text-v2-text-primary">This page isn't part of the case</h1>
			<p className="mt-2 max-w-md font-v2-body text-sm text-v2-text-secondary">
				The case covers Home, Review and Settings. The rest of the sidebar is there for context.
			</p>
			<Button asChild variant="primary" size="sm" className="mt-6">
				<Link href={orgRoutes.overview(orgId)}>Back to Home</Link>
			</Button>
		</div>
	);
}
