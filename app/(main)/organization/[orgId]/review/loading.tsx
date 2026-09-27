import { AdminPageShell } from "@v2/components/layout";
import { ReviewBoardSkeleton } from "@v2/features/org-review";

export default function OrgReviewLoading() {
	return (
		<AdminPageShell title="Review" subtitle="Decide who you want to meet" hideHeaderOnMobile>
			<ReviewBoardSkeleton />
		</AdminPageShell>
	);
}

OrgReviewLoading.displayName = "OrgReviewLoading";
