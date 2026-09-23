"use client";

import { authRoutes } from "@clera/route-factory";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthExpiredError } from "@v2/lib/auth/auth-expired-error";
import { type ReactNode, useState } from "react";

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
						retry: (failureCount, error) => !(error instanceof AuthExpiredError) && failureCount < 3,
					},
				},
			}),
	);

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

V2QueryProvider.displayName = "V2QueryProvider";

export { V2QueryProvider };
