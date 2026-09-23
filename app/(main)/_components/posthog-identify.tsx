"use client";

import { useCurrentInteraction } from "@v2/hooks/use-current-interaction";
import { useUser } from "@v2/hooks/use-user";
import { usePostHog } from "posthog-js/react/slim";
import { useEffect, useRef } from "react";
import logger from "@/utils/logger";

export function PostHogIdentify() {
	const posthog = usePostHog();
	const { user, profile } = useUser();
	const { currentUserInteraction, isLoading } = useCurrentInteraction();
	const lastIdentifiedUserId = useRef<string | null>(null);

	useEffect(() => {
		if (!posthog?.__loaded || lastIdentifiedUserId.current === user.id) return;
		if (isLoading) return;

		const talentId = currentUserInteraction?.id ?? null;
		const userProperties: Record<string, unknown> = {
			email: user.email,
			user_id: user.id,
			role: profile.role,
			profile_id: profile.id,
			...(profile.firstName ? { first_name: profile.firstName } : {}),
			...(profile.lastName ? { last_name: profile.lastName } : {}),
			...(talentId ? { talent_id: talentId } : {}),
		};

		if (posthog.get_distinct_id() !== user.id) {
			if (posthog._isIdentified()) posthog.reset();
			posthog.identify(user.id, userProperties);
		}
		posthog.setPersonProperties(userProperties);
		if (talentId) posthog.group("talent", talentId);
		posthog.startSessionRecording();
		lastIdentifiedUserId.current = user.id;

		logger.info("PostHog user identified", { user_id: user.id, has_talent_id: !!talentId });
	}, [posthog, user.id, user.email, profile, currentUserInteraction?.id, isLoading]);

	return null;
}

PostHogIdentify.displayName = "PostHogIdentify";
