"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { tracking } from "@/services/api";

interface OrgPageTrackerProps {
	orgId: string;
}

function OrgPageTracker({ orgId }: OrgPageTrackerProps) {
	const pathname = usePathname();
	const lastTracked = useRef<string>("");

	useEffect(() => {
		if (!orgId || !pathname) return;
		if (pathname === lastTracked.current) return;
		lastTracked.current = pathname;
		tracking.trackPageView({ pagePath: pathname, organizationId: orgId }).catch(() => {});
	}, [pathname, orgId]);

	return null;
}
OrgPageTracker.displayName = "OrgPageTracker";

export { OrgPageTracker };
