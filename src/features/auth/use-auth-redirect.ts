"use client";

import { talentDashboardRoutes } from "@clera/route-factory";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { auth } from "@/services/api";
import logger from "@/utils/logger";
import { AUTH_NEXT_COOKIE } from "./constants";
import { isClerkOauthAuthorizeNext, isOauthContinuationNext, oauthConsentNextFromRedirectUrl } from "./next-target";
import { getPendingPostSignin } from "./post-signin-client";

const REDIRECT_PATH_KEY = "getclera_redirectPath";

function isValidRedirect(path: string): boolean {
	if (path.startsWith("/") && !path.startsWith("//")) return true;
	return isClerkOauthAuthorizeNext(path);
}

interface UseAuthRedirectOptions {
	callbackNext: string;
}

interface AuthRedirectReturn {
	oauthRedirectUrl: string;
	handleSuccess: () => Promise<void>;
}

function useAuthRedirect({ callbackNext }: UseAuthRedirectOptions): AuthRedirectReturn {
	const router = useRouter();
	const searchParams = useSearchParams();
	const authCheckedRef = useRef(false);

	const rawRedirectParam = searchParams.get("redirect") ?? searchParams.get("redirect_url");
	const redirectParam =
		rawRedirectParam === null ? null : (oauthConsentNextFromRedirectUrl(rawRedirectParam) ?? rawRedirectParam);
	const redirectParamRef = useRef(redirectParam);
	redirectParamRef.current = redirectParam;
	const redirectPersistedRef = useRef(false);
	useEffect(() => {
		if (
			!redirectPersistedRef.current &&
			redirectParam &&
			isValidRedirect(redirectParam) &&
			redirectParam !== talentDashboardRoutes.home()
		) {
			sessionStorage.setItem(REDIRECT_PATH_KEY, redirectParam);
			redirectPersistedRef.current = true;
		}
	}, [redirectParam]);

	useEffect(() => {
		// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not widely supported; document.cookie is fine for a short-lived auth cookie
		document.cookie = `${AUTH_NEXT_COOKIE}=${encodeURIComponent(callbackNext)}; path=/; max-age=300; SameSite=Lax`;
	}, [callbackNext]);

	const oauthRedirectUrl = typeof window !== "undefined" ? `${window.location.origin}/api/auth/callback` : "";

	const navigate = useCallback(
		(target: string, options?: { replace?: boolean }) => {
			if (isOauthContinuationNext(target)) {
				window.location.assign(target);
				return;
			}
			if (options?.replace) {
				router.replace(target);
				return;
			}
			router.push(target);
		},
		[router],
	);

	const resolveRedirect = useCallback(
		async (fallback: string) => {
			const stored = sessionStorage.getItem(REDIRECT_PATH_KEY);
			if (stored && isValidRedirect(stored)) {
				sessionStorage.removeItem(REDIRECT_PATH_KEY);
				logger.info("[useAuthRedirect] Using stored redirect", { redirectTo: stored });
				navigate(stored);
				return;
			}

			try {
				const result = await auth.checkCompleteness();
				if (result.ok && result.data.shouldRedirect && result.data.redirectTo) {
					logger.info("[useAuthRedirect] Redirecting via completeness check", { redirectTo: result.data.redirectTo });
					navigate(result.data.redirectTo);
					return;
				}
			} catch (err) {
				logger.error("[useAuthRedirect] Completeness check failed", err);
			}

			navigate(fallback);
		},
		[navigate],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: one-time mount check, guarded by ref
	useEffect(() => {
		if (authCheckedRef.current) return;
		authCheckedRef.current = true;

		const checkAuth = async () => {
			try {
				const result = await auth.checkCompleteness();
				if (!result.ok || !result.data.shouldRedirect) return;
				const fromUrl = redirectParamRef.current;
				const fromStorage = sessionStorage.getItem(REDIRECT_PATH_KEY);
				const isNonDefault = (v: string) => v !== talentDashboardRoutes.home();
				const target =
					(fromUrl && isValidRedirect(fromUrl) && isNonDefault(fromUrl) && fromUrl) ||
					(fromStorage && isValidRedirect(fromStorage) && isNonDefault(fromStorage) && fromStorage);
				if (target) {
					sessionStorage.removeItem(REDIRECT_PATH_KEY);
					logger.info("[useAuthRedirect] Mount check: using stored redirect", { redirectTo: target });
					navigate(target, { replace: true });
					return;
				}
				if (result.data.redirectTo) {
					navigate(result.data.redirectTo, { replace: true });
				}
			} catch {
				// Not authenticated - stay on login page
			}
		};
		checkAuth();
	}, []);

	const handleSuccess = useCallback(async () => {
		const pending = getPendingPostSignin();
		logger.info("[useAuthRedirect] handleSuccess fired", { hasPending: !!pending });
		if (pending) {
			try {
				const result = await pending;
				logger.info("[useAuthRedirect] Post-signin result", {
					redirectTo: result?.redirectTo,
					signOut: result?.signOut,
				});
				const continuation = sessionStorage.getItem(REDIRECT_PATH_KEY);
				if (!result?.signOut && continuation && isOauthContinuationNext(continuation)) {
					sessionStorage.removeItem(REDIRECT_PATH_KEY);
					logger.info("[useAuthRedirect] Resuming OAuth continuation", { redirectTo: continuation });
					navigate(continuation);
					return;
				}
				if (result?.redirectTo) {
					logger.info("[useAuthRedirect] Post-signin redirect", { redirectTo: result.redirectTo });
					window.location.assign(result.redirectTo);
					return;
				}
			} catch (err) {
				logger.error("[useAuthRedirect] Pending post-signin failed, falling back to resolveRedirect", err);
			}
		}
		await resolveRedirect(talentDashboardRoutes.home());
	}, [navigate, resolveRedirect]);

	return { oauthRedirectUrl, handleSuccess };
}

export { useAuthRedirect };
