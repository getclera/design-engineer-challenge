"use client";

import { TermsAcceptanceBlock } from "@v2/components/data-display";
import { Button } from "@v2/components/ui/button";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@v2/components/ui/dialog";
import { useCallback, useEffect, useState } from "react";
import { onboardingApi } from "@/services/api";
import logger from "@/utils/logger";

const DISMISS_KEY_PREFIX = "terms-dismiss-";
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000;

function isDismissed(orgId: string): boolean {
	try {
		const raw = localStorage.getItem(`${DISMISS_KEY_PREFIX}${orgId}`);
		if (!raw) return false;
		const expiry = Number(raw);
		if (Date.now() < expiry) return true;
		localStorage.removeItem(`${DISMISS_KEY_PREFIX}${orgId}`);
		return false;
	} catch {
		return false;
	}
}

function saveDismiss(orgId: string) {
	try {
		localStorage.setItem(`${DISMISS_KEY_PREFIX}${orgId}`, String(Date.now() + DISMISS_TTL_MS));
	} catch {}
}

interface TermsAcceptModalProps {
	orgId: string;
}

function TermsAcceptModal({ orgId }: TermsAcceptModalProps) {
	const [open, setOpen] = useState(false);
	const [accepting, setAccepting] = useState(false);

	useEffect(() => {
		if (isDismissed(orgId)) return;
		onboardingApi
			.checkTerms(orgId)
			.then((result) => {
				if (result.ok && !result.data.accepted) setOpen(true);
			})
			.catch((err) => {
				logger.warn("[terms-modal] Failed to check terms status", { error: String(err) });
			});
	}, [orgId]);

	const handleDismiss = useCallback(() => {
		saveDismiss(orgId);
		setOpen(false);
	}, [orgId]);

	const handleAccept = useCallback(async () => {
		setAccepting(true);
		try {
			const result = await onboardingApi.acceptTerms(orgId);
			if (result.ok) {
				setOpen(false);
			} else {
				logger.error("[terms-modal] Accept failed", { error: result.error.message });
			}
		} catch (err) {
			logger.error("[terms-modal] Accept error", { error: String(err) });
		} finally {
			setAccepting(false);
		}
	}, [orgId]);

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				if (!v && !accepting) handleDismiss();
			}}
		>
			<DialogContent className="p-0 gap-0 [&>button]:hidden max-h-[90vh] flex flex-col sm:max-w-lg">
				<DialogHeader className="px-6 pt-8 pb-4">
					<DialogTitle>Terms of Service</DialogTitle>
					<DialogDescription>Quick formality before you get started.</DialogDescription>
				</DialogHeader>
				<DialogBody className="px-6 pb-8 pt-2">
					<TermsAcceptanceBlock
						onAccept={handleAccept}
						isPending={accepting}
						ctaLabel="I accept"
						pendingLabel="Accepting..."
					/>
					<div className="mt-2 flex justify-end">
						<Button variant="ghost" onClick={handleDismiss} disabled={accepting}>
							Later
						</Button>
					</div>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
TermsAcceptModal.displayName = "TermsAcceptModal";

export { TermsAcceptModal };
