"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authKeys, companyKeys } from "@/lib/query-keys";
import { callApi, fetchApi, unwrap } from "@/services/api/client";
import { membersKey, myProfileKey } from "./keys";
import type { MyProfile, MyProfileUpdate } from "./my-profile";
import { useAutosave } from "./use-company-profile";

export function useMyProfile(orgId: string) {
	return useQuery({
		queryKey: myProfileKey(orgId),
		queryFn: () => fetchApi<MyProfile>(`/api/organizations/${orgId}/me`).then(unwrap),
	});
}

/**
 * Autosave for your own profile and notifications. Your name, photo and link also show in the sidebar, the
 * Members list and Contacts, so those refresh after each save (not this form: it would undo what you're typing).
 */
export function useSaveMyProfile(orgId: string) {
	const queryClient = useQueryClient();
	return useAutosave<MyProfile>(
		myProfileKey(orgId),
		(change) =>
			callApi<MyProfile, MyProfileUpdate>(`/api/organizations/${orgId}/me`, change as MyProfileUpdate, {
				method: "PATCH",
			}).then(unwrap),
		() => {
			queryClient.invalidateQueries({ queryKey: authKeys.me() });
			queryClient.invalidateQueries({ queryKey: membersKey(orgId), exact: true });
			queryClient.invalidateQueries({ queryKey: companyKeys.contactOptions(orgId) });
		},
	);
}
