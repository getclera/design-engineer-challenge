"use client";

import { EmptyState } from "@v2/components/data-display";
import { DetailSheet } from "@v2/components/layout";
import type { OrgTalentTracking } from "@v2/components/tracking";
import { TalentProfileContent } from "@v2/features/talent-profile";
import type { ReactNode } from "react";
import type { OrgTalentProfileBundle } from "@/services/api/org-talents";
import { OrgProfileSkeleton } from "./org-profile-skeleton";

interface TalentProfileSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	talentName: string | null;
	bundle: OrgTalentProfileBundle | undefined;
	isLoading: boolean;
	isError: boolean;
	displayNameOverride?: string | null;
	avatarUrlFallback?: string | null;
	footer?: ReactNode;
	tracking?: OrgTalentTracking;
}

function TalentProfileSheet({
	open,
	onOpenChange,
	talentName,
	bundle,
	isLoading,
	isError,
	displayNameOverride,
	avatarUrlFallback,
	footer,
	tracking,
}: TalentProfileSheetProps) {
	const resolvedName = bundle?.header.fullName ?? talentName ?? "Candidate";
	const bundleWithAvatar =
		bundle && !bundle.header.avatarUrl && avatarUrlFallback
			? { ...bundle, header: { ...bundle.header, avatarUrl: avatarUrlFallback } }
			: bundle;

	return (
		<DetailSheet
			open={open}
			onOpenChange={onOpenChange}
			title={resolvedName}
			a11yTitle="Candidate Profile"
			contentClassName="md:w-[70vw] lg:w-[50vw] lg:min-w-150"
			footer={isError ? undefined : footer}
		>
			{isLoading && <OrgProfileSkeleton />}
			{isError && <EmptyState heading="Could not load profile" description="Something went wrong. Please try again." />}
			{bundleWithAvatar && (
				<TalentProfileContent
					bundle={bundleWithAvatar}
					displayNameOverride={displayNameOverride ?? resolvedName}
					tracking={tracking}
				/>
			)}
		</DetailSheet>
	);
}
TalentProfileSheet.displayName = "TalentProfileSheet";

export { TalentProfileSheet, type TalentProfileSheetProps };
