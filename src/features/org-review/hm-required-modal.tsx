"use client";

import { OrgDashboardEvents } from "@clera/posthog-events";
import { orgRoutes } from "@clera/route-factory";
import { ArrowRight, CalendarPlus } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { Checkbox } from "@v2/components/ui/checkbox";
import { Dialog, DialogContent } from "@v2/components/ui/dialog";
import { DialogHeaderBar } from "@v2/components/ui/dialog-header-bar";
import { Label } from "@v2/components/ui/label";
import { AskManagerHint, useCanManageContacts } from "@v2/features/org-permissions";
import Link from "next/link";
import { usePostHog } from "posthog-js/react/slim";
import { useEffect, useRef, useState } from "react";
import { suppressHmLinkWarning } from "./hm-warning-cookie";

interface HmRequiredModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onContinue: () => void;
	orgId: string;
	roleId: string | null;
	reason: "no_hm" | "hm_no_link" | null;
	hmName: string | null;
	hmContactId: string | null;
}

function HmRequiredModal({
	isOpen,
	onOpenChange,
	onContinue,
	orgId,
	roleId,
	reason,
	hmName,
	hmContactId,
}: HmRequiredModalProps) {
	const [dontShowAgain, setDontShowAgain] = useState(false);
	const posthog = usePostHog();
	const canManageContacts = useCanManageContacts();
	const actionedRef = useRef(false);
	const noHm = reason !== "hm_no_link";
	const eventProps = { org_id: orgId, role_id: roleId, reason: noHm ? "no_hm" : "hm_no_link" };
	const title = noHm ? "No hiring manager for this role" : `No scheduling link for ${hmName}`;
	const body = noHm
		? "This role has no hiring manager assigned yet. The intro still goes out, but without a scheduling link candidates can't book directly, making it harder to keep track of when interviews get scheduled."
		: `${hmName} is the hiring manager for this role but has no scheduling link yet. The intro still goes out, but candidates can't book directly, making it harder to keep track of when interviews get scheduled.`;
	const hint = noHm
		? "Assign a hiring manager with a calendar link so candidates can book directly."
		: `Add a calendar link to ${hmName} in your contact settings so candidates can book directly.`;
	const showCta = noHm || canManageContacts;
	const ctaLabel = noHm ? "Set up hiring manager" : "Add scheduling link";
	const ctaHref =
		noHm && roleId
			? orgRoutes.roles.edit(orgId, roleId, { highlightHm: true })
			: orgRoutes.settings.contacts(orgId, hmContactId ?? undefined);

	// biome-ignore lint/correctness/useExhaustiveDependencies: fire once per open, not on prop churn
	useEffect(() => {
		if (!isOpen) return;
		actionedRef.current = false;
		posthog?.capture(OrgDashboardEvents.HM_LINK_WARNING_SHOWN, eventProps);
	}, [isOpen]);

	const handleOpenChange = (open: boolean) => {
		if (!open && !actionedRef.current) {
			posthog?.capture(OrgDashboardEvents.HM_LINK_WARNING_DISMISSED, eventProps);
		}
		onOpenChange(open);
	};

	const handleContinue = () => {
		actionedRef.current = true;
		posthog?.capture(OrgDashboardEvents.HM_LINK_WARNING_CONTINUED, { ...eventProps, suppressed: dontShowAgain });
		if (dontShowAgain) suppressHmLinkWarning();
		onOpenChange(false);
		onContinue();
	};

	const handleSetupClick = () => {
		actionedRef.current = true;
		posthog?.capture(OrgDashboardEvents.HM_LINK_WARNING_SETUP_CLICKED, eventProps);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="!flex !flex-col max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-120 [&>button]:hidden">
				<DialogHeaderBar title={title} onClose={() => handleOpenChange(false)} />

				<div className="space-y-4 px-5 py-5">
					<div className="space-y-2">
						<p className="font-v2-body text-sm text-v2-text-primary">{body}</p>
						{showCta ? (
							<p className="font-v2-body text-sm text-v2-text-tertiary">{hint}</p>
						) : (
							<AskManagerHint orgId={orgId} action="add scheduling links to contacts" />
						)}
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="hm-warning-dont-show"
							checked={dontShowAgain}
							onCheckedChange={(checked) => setDontShowAgain(checked === true)}
						/>
						<Label htmlFor="hm-warning-dont-show" className="cursor-pointer font-v2-body text-sm font-normal">
							Don't show this again
						</Label>
					</div>
				</div>

				<div className="flex flex-shrink-0 items-center justify-between border-t border-v2-border-divider px-5 py-4">
					<Button variant={showCta ? "ghost" : "primary"} onClick={handleContinue} className="gap-2">
						Continue anyway
						<ArrowRight className="size-4" />
					</Button>
					{showCta && (
						<Button variant="primary" asChild className="gap-2">
							<Link href={ctaHref} onClick={handleSetupClick}>
								<CalendarPlus className="size-4" />
								{ctaLabel}
							</Link>
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

HmRequiredModal.displayName = "HmRequiredModal";

export { HmRequiredModal };
