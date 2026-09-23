"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { authKeys } from "@/lib/query-keys";
import type { AuthMeResponse, SignInResponse } from "@/services/api/auth";
import { auth } from "@/services/api/auth";

const authMeKey = authKeys.me();

interface UseAuthApiParams {
	enabled?: boolean;
}

interface UseAuthApiReturn {
	user: AuthMeResponse["user"];
	profile: AuthMeResponse["profile"];
	fullProfile: AuthMeResponse["fullProfile"];
	session: AuthMeResponse["session"];
	isAuthenticated: boolean;
	isLoading: boolean;
	error: Error | null;

	signInWithOtp: ReturnType<typeof useMutation<SignInResponse | null, Error, { email: string }>>;
	signOut: ReturnType<typeof useMutation<void, Error, void>>;
	refetch: () => Promise<void>;
	invalidate: () => Promise<void>;
}

export function useAuthApi({ enabled = true }: UseAuthApiParams = {}): UseAuthApiReturn {
	const queryClient = useQueryClient();

	const {
		data: authState,
		isLoading,
		error,
		refetch: refetchQuery,
	} = useQuery({
		enabled,
		queryKey: authMeKey,
		queryFn: async (): Promise<AuthMeResponse> => {
			const result = await auth.me();
			if (!result.ok) {
				return {
					authenticated: false,
					user: null,
					profile: null,
					fullProfile: null,
					session: null,
				};
			}
			return result.data;
		},
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	const invalidate = useCallback(async () => {
		await queryClient.invalidateQueries({ queryKey: authMeKey });
	}, [queryClient]);

	const refetch = useCallback(async () => {
		await refetchQuery();
	}, [refetchQuery]);

	const signInWithOtp = useMutation({
		mutationFn: async ({ email }: { email: string }) => {
			const result = await auth.signInWithOtp(email);
			if (!result.ok) {
				throw new Error(result.error.message);
			}
			return result.data;
		},
	});

	const signOut = useMutation({
		mutationFn: async () => {
			const result = await auth.signOut();
			if (!result.ok) {
				throw new Error(result.error.message);
			}
		},
		onSuccess: async () => {
			queryClient.clear();
		},
	});

	return {
		user: authState?.user ?? null,
		profile: authState?.profile ?? null,
		fullProfile: authState?.fullProfile ?? null,
		session: authState?.session ?? null,
		isAuthenticated: authState?.authenticated ?? false,
		isLoading,
		error,

		signInWithOtp,
		signOut,

		refetch,
		invalidate,
	};
}
