"use client";

import { orgRoutes } from "@clera/route-factory";
import { Buildings, UsersThree } from "@phosphor-icons/react";
import { useIntroBlockers } from "@v2/features/company-contacts";
import { cn } from "@v2/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { companyGaps } from "./company-profile";
import { useCompanyProfile } from "./use-company-profile";

/** Company · Team, each with what's still missing, so the count follows you from the sidebar badge to the fix. */
export function SettingsTabs({ orgId }: { orgId: string }) {
	const pathname = usePathname();
	const { data: profile } = useCompanyProfile(orgId);
	const blocked = useIntroBlockers(orgId).length;
	const gaps = profile ? companyGaps(profile).length : 0;
	const tabs = [
		{
			key: "company",
			label: "Company",
			icon: Buildings,
			href: orgRoutes.settings.company(orgId),
			count: gaps,
			what: "missing",
		},
		{
			key: "team",
			label: "Team",
			icon: UsersThree,
			href: orgRoutes.settings.members(orgId),
			count: blocked,
			what: "blocking intros",
		},
	] as const;
	return (
		<nav aria-label="Settings" className="-mt-1 flex gap-1 border-v2-border-divider border-b">
			{tabs.map((tab) => {
				const on = pathname === tab.href;
				return (
					<Link
						key={tab.key}
						href={tab.href}
						aria-current={on ? "page" : undefined}
						className={cn(
							"-mb-px flex items-center gap-2 border-b-2 px-2.5 pt-1.5 pb-2.5 font-medium font-v2-body text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v2-brand-teal focus-visible:ring-inset",
							on
								? "border-v2-brand-teal text-v2-text-brand"
								: "border-transparent text-v2-text-secondary hover:text-v2-text-primary",
						)}
					>
						<tab.icon size={15} weight={on ? "fill" : "regular"} />
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
	);
}

SettingsTabs.displayName = "SettingsTabs";
