"use client";

import { OrgDashboardEvents } from "@clera/posthog-events";
import { usePostHog } from "posthog-js/react/slim";
import type { ReactNode } from "react";
import { type LinkedinClickElement, linkedinClickedEventProps, type OrgTalentTracking } from "./org-talent-tracking";

interface LinkedInProfileLinkProps {
	url: string;
	children: ReactNode;
	className?: string;
	label?: string;
	element: Exclude<LinkedinClickElement, "row">;
	tracking?: OrgTalentTracking;
}

function LinkedInProfileLink({ url, children, className, label, element, tracking }: LinkedInProfileLinkProps) {
	const posthog = usePostHog();

	const handleClick = () => {
		if (!tracking) return;
		posthog?.capture(OrgDashboardEvents.TALENT_LINKEDIN_CLICKED, linkedinClickedEventProps(tracking, element, url));
	};

	return (
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={label}
			className={className}
			onClick={handleClick}
		>
			{children}
		</a>
	);
}
LinkedInProfileLink.displayName = "LinkedInProfileLink";

export { LinkedInProfileLink };
