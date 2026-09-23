import { PhClock } from "@v2/components/ui/phosphor-icons";

export function PendingApprovalBanner() {
	return (
		<div className="flex items-center gap-2.5 border-b border-v2-border-warm bg-v2-bg-input px-4 py-2.5">
			<PhClock className="size-4 shrink-0 fill-current text-v2-text-secondary" />
			<p className="font-v2-body text-sm text-v2-text-secondary">
				Your account is being reviewed by the Clera team. You can browse talent and request intros now &mdash; outreach
				starts as soon as the review completes, usually within a day.
			</p>
		</div>
	);
}

PendingApprovalBanner.displayName = "PendingApprovalBanner";
