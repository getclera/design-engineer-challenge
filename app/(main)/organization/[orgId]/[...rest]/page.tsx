import { orgRoutes } from "@clera/route-factory";
import { CompassIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@v2/components/ui/button";
import Link from "next/link";

const PAGE_NAMES: Record<string, string> = {
	pipeline: "Pipeline",
	roles: "Roles",
	integrations: "Integrations",
	"talent-search": "Talent search",
	"external-search": "Search",
	searches: "Searches",
};

/** Sections that aren't built yet (Pipeline, Roles, Integrations…) land here instead of a 404. */
export default async function ComingSoon({ params }: { params: Promise<{ orgId: string; rest: string[] }> }) {
	const { orgId, rest } = await params;
	const name = PAGE_NAMES[rest[0]] ?? "This page";
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-14 text-center">
			<CompassIcon size={28} weight="light" className="mb-4 text-v2-text-tertiary" />
			<h1 className="font-v2-heading text-lg text-v2-text-primary">{name} is on its way</h1>
			<p className="mt-2 max-w-md font-v2-body text-sm text-v2-text-secondary">
				We're still building this part of Clera. Your candidates are waiting in Review.
			</p>
			<Button asChild variant="primary" size="sm" className="mt-6">
				<Link href={orgRoutes.review(orgId)}>Go to Review</Link>
			</Button>
		</div>
	);
}
