import { fetchApi } from "./client";

function trackPageView(params: { pagePath: string; organizationId: string }) {
	return fetchApi<{ ok: boolean }>("/api/track/page-view", {
		method: "POST",
		body: JSON.stringify(params),
	});
}

export const tracking = { trackPageView };
