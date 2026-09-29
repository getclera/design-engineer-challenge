"use client";

import { orgRoutes } from "@clera/route-factory";
import { Buildings, PaperPlaneTilt, User, Users } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useIntroBlockers } from "@v2/features/company-contacts";
import { cn } from "@v2/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { organizations, unwrap } from "@/services/api";
import { companyGaps } from "./company-profile";
import { candidatesGoNowhere, type Delivery } from "./delivery";
import { deliveryKey } from "./keys";
import { useCompanyProfile } from "./use-company-profile";

/**
 * Company · Communications · Members · Profile, each with what's still missing, so the count follows you from the
 * sidebar badge to the fix. Under the tabs, one line on what the tab is for (the original product's words).
 */
export function SettingsTabs({ orgId }: { orgId: string }) {
	const pathname = usePathname();
	const { data: profile } = useCompanyProfile(orgId);
	const { data: delivery } = useQuery({
		queryKey: deliveryKey(orgId),
		queryFn: () => organizations.getDeliveryChannels(orgId).then(unwrap) as Promise<unknown> as Promise<Delivery>,
	});
	const blocked = useIntroBlockers(orgId).length;
	const tabs = [
		{
			key: "company",
			label: "Company",
			icon: Buildings,
			href: orgRoutes.settings.company(orgId),
			count: profile ? companyGaps(profile).length : 0,
			what: "sections missing something",
			lead: "Public-facing company information shown to candidates.",
		},
		{
			key: "communications",
			label: "Communications",
			icon: PaperPlaneTilt,
			href: orgRoutes.settings.delivery(orgId),
			count: delivery && candidatesGoNowhere(delivery) ? 1 : 0,
			what: "new candidates go nowhere",
			lead: "Where we send the candidates you get from us.",
		},
		{
			key: "members",
			label: "Members",
			icon: Users,
			href: orgRoutes.settings.members(orgId),
			count: blocked,
			what: "roles that can't book intros",
			lead: "Who can use Clera, and who candidates meet.",
		},
		{
			key: "profile",
			label: "Profile",
			icon: User,
			href: orgRoutes.settings.profile(orgId),
			count: 0,
			what: "",
			lead: "Personal details and your avatar.",
		},
	] as const;
	const current = tabs.find((tab) => pathname === tab.href);

	return (
		<div className="flex flex-col gap-4">
			{/* Phones: the tabs wrap to a second line rather than hide off-screen. */}
			<nav aria-label="Settings" className="-mt-1 flex flex-wrap gap-x-1 border-v2-border-divider border-b">
				{tabs.map((tab) => {
					const on = tab === current;
					return (
						<Link
							key={tab.key}
							href={tab.href}
							aria-current={on ? "page" : undefined}
							className={cn(
								"-mb-px flex shrink-0 items-center gap-2 border-b-2 px-2.5 pt-1.5 pb-2.5 font-medium font-v2-body text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal focus-visible:ring-inset max-sm:px-2",
								on
									? "border-v2-brand-teal text-v2-text-brand"
									: "border-transparent text-v2-text-secondary hover:text-v2-text-primary",
							)}
						>
							<tab.icon size={15} weight={on ? "fill" : "regular"} className="max-sm:hidden" />
							{tab.label}
							{tab.count > 0 && (
								<span className="grid h-4.5 min-w-4.5 place-items-center rounded-full bg-v2-status-warning-bg px-1 font-semibold text-2xs text-v2-status-warning tabular-nums">
									{tab.count}
									<span className="sr-only"> {tab.what}</span>
								</span>
							)}
						</Link>
					);
				})}
			</nav>
			{current && <p className="font-v2-body text-sm text-v2-text-secondary">{current.lead}</p>}
		</div>
	);
}

SettingsTabs.displayName = "SettingsTabs";
