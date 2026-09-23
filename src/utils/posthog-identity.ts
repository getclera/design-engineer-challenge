import type { PostHog } from "posthog-js";
import { PH_DISTINCT_ID_COOKIE } from "@/lib/posthog-constants";
import { deleteCookie } from "@/utils/cookies";

export function resetPostHogIdentity(posthog: Pick<PostHog, "reset"> | undefined) {
	posthog?.reset();
	deleteCookie(PH_DISTINCT_ID_COOKIE);
}
