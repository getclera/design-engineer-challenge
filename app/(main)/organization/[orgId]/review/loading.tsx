import { AdminPageShell } from "@v2/components/layout";
import { ReviewBoardSkeleton } from "@v2/features/org-review";

export default function OrgReviewLoading() {
	return (
		<AdminPageShell title="Review" subtitle="Everyone waiting on your decision" hideHeaderOnMobile>
			<ReviewBoardSkeleton />
		</AdminPageShell>
	);
}

OrgReviewLoading.displayName = "OrgReviewLoading";
