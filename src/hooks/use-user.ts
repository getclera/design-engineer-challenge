"use client";

import { getInitials } from "@clera/shared-utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AuthExpiredError } from "@v2/lib/auth/auth-expired-error";
import { authKeys } from "@/lib/query-keys";
import { type AuthMeResponse, auth } from "@/services/api/auth";
import { unwrap } from "@/services/api/client";

export interface CurrentUser extends Omit<AuthMeResponse, "user" | "profile"> {
	user: NonNullable<AuthMeResponse["user"]>;
	profile: NonNullable<AuthMeResponse["profile"]>;
	name: string;
	initials: string;
	avatarUrl: string | undefined;
}

export { AuthExpiredError };

export type AuthenticatedMeResponse = Omit<AuthMeResponse, "user" | "profile"> & {
	user: NonNullable<AuthMeResponse["user"]>;
	profile: NonNullable<AuthMeResponse["profile"]>;
};

export const fetchAuthenticatedUser = async (): Promise<AuthenticatedMeResponse> => {
	const data = await auth.me().then(unwrap);
	if (!data.user || !data.profile) {
		throw new AuthExpiredError();
	}
	return { ...data, user: data.user, profile: data.profile };
};

const selectCurrentUser = (data: AuthenticatedMeResponse): CurrentUser => {
	const name = [data.profile.firstName, data.profile.lastName].filter(Boolean).join(" ") || data.user.email;
	return {
		...data,
		name,
		initials: getInitials(name),
		avatarUrl: data.fullProfile?.avatar_url ?? undefined,
	};
};

export function useUser(): CurrentUser {
	return useSuspenseQuery({
		queryKey: authKeys.meAuthed(),
		queryFn: fetchAuthenticatedUser,
		select: selectCurrentUser,
		staleTime: Number.POSITIVE_INFINITY,
		retry: (failureCount, error) => failureCount < 3 && !(error instanceof AuthExpiredError),
	}).data;
}
