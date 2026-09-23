export const orgTalentKeys = {
	all: ["org-talent"] as const,
	profile: (orgId: string, talentId: string) => [...orgTalentKeys.all, "profile", orgId, talentId] as const,
	publicDropProfiles: (dropId: string) => [...orgTalentKeys.all, "public-drop-profile", dropId] as const,
	publicDropProfile: (dropId: string, talentId: string) =>
		[...orgTalentKeys.publicDropProfiles(dropId), talentId] as const,
};
