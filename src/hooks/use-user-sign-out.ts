"use client";

import { authRoutes } from "@clera/route-factory";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePostHog } from "posthog-js/react/slim";
import { toast } from "sonner";
import { auth } from "@/services/api/auth";
import { unwrap } from "@/services/api/client";
import logger from "@/utils/logger";
import { resetPostHogIdentity } from "@/utils/posthog-identity";

export function useUserSignOut() {
	const queryClient = useQueryClient();
	const posthog = usePostHog();

	return useMutation({
		mutationFn: () => {
			logger.info("user sign out requested");
			return auth.signOut().then(unwrap);
		},
		onSuccess: () => {
			resetPostHogIdentity(posthog);
			queryClient.clear();
			try {
				sessionStorage.removeItem("getclera_redirectPath");
			} catch {} // v2-precheck-ignore
			window.location.href = authRoutes.login();
		},
		onError: () => toast.error("Failed to sign out"),
	});
}
