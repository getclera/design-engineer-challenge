import type { PostHogConfig } from "posthog-js";
import { isDev } from "@/config/env";
import { isSeoPublicPath } from "@/utils/internal-routes";
import { beforeSendFilter } from "@/utils/posthogBeforeSend";

export function buildPostHogInitOptions(pathname: string): Partial<PostHogConfig> {
	return {
		api_host: "/r",
		ui_host: "https://us.i.posthog.com",
		disable_compression: true,
		before_send: beforeSendFilter,
		persistence: "localStorage+cookie",
		secure_cookie: !isDev,
		cross_subdomain_cookie: false,
		person_profiles: "identified_only",
		capture_pageview: false,
		disable_surveys: true,
		disable_session_recording: isSeoPublicPath(pathname),
		session_recording: { recordCrossOriginIframes: false },
		rate_limiting: {
			events_per_second: 10,
			events_burst_limit: 100,
		},
	};
}
