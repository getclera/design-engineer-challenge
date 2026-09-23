"use client";

import { SidebarAnnouncementEvents, type SidebarAnnouncementSurface } from "@clera/posthog-events";
import { ArrowRight, X } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { useSidebar } from "@v2/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { usePostHog } from "posthog-js/react/slim";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDismissed } from "@/hooks/use-dismissed";
import { announcementDismissKey, type SidebarAnnouncement } from "./catalog";

interface SidebarAnnouncementCardProps {
	announcement: SidebarAnnouncement;
	href: string;
	surface: SidebarAnnouncementSurface;
	orgId?: string;
	external?: boolean;
}

const linkClassName = "block p-3 pr-8 transition-colors hover:bg-v2-bg-input";

export function SidebarAnnouncementCard({
	announcement,
	href,
	surface,
	orgId,
	external = false,
}: SidebarAnnouncementCardProps) {
	const { isDismissed, dismiss } = useDismissed(announcementDismissKey(announcement.id));
	const posthog = usePostHog();
	const { state, isMobile } = useSidebar();
	const lastTracked = useRef<string | null>(null);
	const [hasHydrated, setHasHydrated] = useState(false);
	const eventProps = useMemo(
		() => ({ announcement_id: announcement.id, surface, org_id: orgId ?? null }),
		[announcement.id, surface, orgId],
	);
	const isOnScreen = isMobile || state === "expanded";
	const trackingKey = `${surface}:${announcement.id}`;

	useEffect(() => {
		setHasHydrated(true);
	}, []);

	useEffect(() => {
		if (!hasHydrated || isDismissed || !posthog || !isOnScreen || lastTracked.current === trackingKey) return;
		lastTracked.current = trackingKey;
		posthog.capture(SidebarAnnouncementEvents.VIEWED, eventProps);
	}, [hasHydrated, posthog, isDismissed, isOnScreen, trackingKey, eventProps]);

	if (isDismissed) return null;

	const trackCtaClick = () => posthog?.capture(SidebarAnnouncementEvents.CTA_CLICKED, eventProps);

	const handleDismiss = () => {
		posthog?.capture(SidebarAnnouncementEvents.DISMISSED, eventProps);
		dismiss();
	};

	const content = (
		<>
			<span className="block w-fit rounded-full bg-v2-bg-badge-teal px-2 py-0.5 font-v2-body text-xs font-semibold text-v2-text-brand">
				{announcement.label}
			</span>
			<p className="mt-2 font-v2-body text-[11px] leading-[1.45] text-v2-text-tertiary">{announcement.body}</p>
			{announcement.logoSrcs.length > 0 && (
				<span className="mt-1.5 flex items-center gap-1">
					{announcement.logoSrcs.map((logoSrc) => (
						<span
							key={logoSrc}
							className="flex size-6 items-center justify-center rounded-v2-sm border border-v2-border-warm-soft bg-v2-bg-input"
						>
							<Image src={logoSrc} alt="" width={14} height={14} className="size-3.5 object-contain" />
						</span>
					))}
				</span>
			)}
			<span className="mt-3 flex items-center gap-1 font-v2-body text-xs font-medium text-v2-text-brand">
				{announcement.ctaLabel}
				<ArrowRight className="size-3" aria-hidden="true" />
			</span>
		</>
	);

	return (
		<aside className="relative mx-2 mb-2 rounded-v2-md border border-v2-border-warm-soft bg-v2-bg-card group-data-[collapsible=icon]:hidden">
			{external ? (
				<a href={href} target="_blank" rel="noreferrer" className={linkClassName} onClick={trackCtaClick}>
					{content}
				</a>
			) : (
				<Link href={href} className={linkClassName} onClick={trackCtaClick}>
					{content}
				</Link>
			)}
			<Button
				variant="unstyled"
				size="unstyled"
				type="button"
				onClick={handleDismiss}
				className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-v2-sm text-v2-text-tertiary transition-colors after:absolute after:-inset-2.5 md:after:hidden hover:bg-v2-bg-input hover:text-v2-text-primary"
				aria-label={`Dismiss ${announcement.label}`}
			>
				<X className="size-3.5" aria-hidden="true" />
			</Button>
		</aside>
	);
}

SidebarAnnouncementCard.displayName = "SidebarAnnouncementCard";
