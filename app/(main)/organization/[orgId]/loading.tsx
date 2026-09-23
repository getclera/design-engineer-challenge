import { ProseSkeleton } from "@v2/components/layout";

export default function OrgIdLoading() {
	return (
		<div className="p-6">
			<ProseSkeleton count={1} lines={2} />
		</div>
	);
}
