"use client";

import { authRoutes } from "@clera/route-factory";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthExpiredError } from "@v2/lib/auth/auth-expired-error";
import { type ReactNode, useState } from "react";
import { ApiRequestError } from "@/services/api/client";

function redirectToLoginOnAuthExpiry(error: unknown) {
	if (!(error instanceof AuthExpiredError)) return;
	const redirectTo = `${window.location.pathname}${window.location.search}`;
	window.location.href = authRoutes.loginWithRedirect(redirectTo);
}

function V2QueryProvider({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				queryCache: new QueryCache({ onError: redirectToLoginOnAuthExpiry }),
				mutationCache: new MutationCache({ onError: redirectToLoginOnAuthExpiry }),
				defaultOptions: {
					queries: {
						staleTime: 5 * 60 * 1000,
						refetchOnWindowFocus: false,
						// A 4xx (not found, forbidden) won't change on a second try: show it at once. Timeouts and rate limits still retry.
						retry: (failureCount, error) =>
							!(error instanceof AuthExpiredError) &&
							!(
								error instanceof ApiRequestError &&
								error.status >= 400 &&
								error.status < 500 &&
								![408, 429].includes(error.status)
							) &&
							failureCount < 3,
					},
				},
			}),
	);

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

V2QueryProvider.displayName = "V2QueryProvider";

export { V2QueryProvider };
