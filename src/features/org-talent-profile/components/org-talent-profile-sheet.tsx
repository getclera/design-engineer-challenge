"use client";

import type { OrgTalentSurface } from "@v2/components/tracking";
import type { ReactNode } from "react";
import { useOrgTalentProfile } from "../hooks/use-org-talent-profile";
import { TalentProfileSheet } from "./sheet-inner";

interface OrgTalentProfileSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	orgId: string;
	talentId: string | null;
	talentName: string | null;
	avatarUrlFallback?: string | null;
	footer?: ReactNode;
	surface?: OrgTalentSurface;
	trackingSource?: string | null;
}

function OrgTalentProfileSheet({
	open,
	onOpenChange,
	orgId,
	talentId,
	talentName,
	avatarUrlFallback,
	footer,
	surface = "talent_sheet",
	trackingSource,
}: OrgTalentProfileSheetProps) {
	const { data: bundle, isLoading, isError } = useOrgTalentProfile(orgId, talentId ?? "");

	if (!talentId) return null;

	return (
		<TalentProfileSheet
			open={open}
			onOpenChange={onOpenChange}
			talentName={talentName}
			bundle={bundle}
			isLoading={isLoading}
			isError={isError}
			avatarUrlFallback={avatarUrlFallback}
			footer={footer}
			tracking={{ orgId, talentId, surface, source: trackingSource ?? null }}
		/>
	);
}
OrgTalentProfileSheet.displayName = "OrgTalentProfileSheet";

export { OrgTalentProfileSheet };
