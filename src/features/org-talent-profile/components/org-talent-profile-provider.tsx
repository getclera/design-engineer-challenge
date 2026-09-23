"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { orgTalents } from "@/services/api/org-talents";
import { OrgTalentProfileSheet } from "./org-talent-profile-sheet";

interface TalentRef {
	talentId: string;
	talentName: string | null;
	avatarUrl?: string | null;
	source?: "review" | "talent_search";
	appliedFilters?: Record<string, unknown> | null;
	footer?: ReactNode;
}

interface OrgTalentProfileContextValue {
	openTalentProfile: (talent: TalentRef) => void;
	closeTalentProfile: () => void;
}

const OrgTalentProfileContext = createContext<OrgTalentProfileContextValue | null>(null);

interface OrgTalentProfileProviderProps {
	orgId: string;
	children: ReactNode;
}

export function OrgTalentProfileProvider({ orgId, children }: OrgTalentProfileProviderProps) {
	const [talent, setTalent] = useState<TalentRef | null>(null);

	const openTalentProfile = useCallback(
		(next: TalentRef) => {
			setTalent(next);
			if (next.source) {
				orgTalents
					.recordTalentView(orgId, {
						talentId: next.talentId,
						source: next.source,
						appliedFilters: next.appliedFilters ?? null,
					})
					.catch(() => {});
			}
		},
		[orgId],
	);
	const handleOpenChange = useCallback((open: boolean) => {
		if (!open) setTalent(null);
	}, []);
	const closeTalentProfile = useCallback(() => setTalent(null), []);

	const value = useMemo(() => ({ openTalentProfile, closeTalentProfile }), [openTalentProfile, closeTalentProfile]);

	return (
		<OrgTalentProfileContext.Provider value={value}>
			{children}
			<OrgTalentProfileSheet
				open={!!talent}
				onOpenChange={handleOpenChange}
				orgId={orgId}
				talentId={talent?.talentId ?? null}
				talentName={talent?.talentName ?? null}
				avatarUrlFallback={talent?.avatarUrl ?? null}
				footer={talent?.footer ?? null}
				trackingSource={talent?.source ?? null}
			/>
		</OrgTalentProfileContext.Provider>
	);
}
OrgTalentProfileProvider.displayName = "OrgTalentProfileProvider";

export function useOpenTalentProfile() {
	const ctx = useContext(OrgTalentProfileContext);
	if (!ctx) throw new Error("useOpenTalentProfile must be used within OrgTalentProfileProvider");
	return ctx.openTalentProfile;
}

export function useCloseTalentProfile() {
	const ctx = useContext(OrgTalentProfileContext);
	if (!ctx) throw new Error("useCloseTalentProfile must be used within OrgTalentProfileProvider");
	return ctx.closeTalentProfile;
}
