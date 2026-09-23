"use client";

import { Check, X } from "@phosphor-icons/react";
import { Toaster as Sonner } from "sonner";

type V2ToasterProps = {
	duration?: number;
};

export function V2Toaster({ duration = 4000 }: V2ToasterProps) {
	return (
		<Sonner
			position="bottom-right"
			expand={false}
			icons={{
				success: <Check size={16} className="text-v2-status-active" />,
				error: <X size={16} className="text-v2-status-error" />,
			}}
			toastOptions={{
				classNames: {
					toast: "!border !border-v2-border-warm !shadow-md !rounded-v2-lg !font-v2-body",
					title: "!font-light !text-sm",
					description: "!text-xs !font-light",
					success: "!bg-v2-status-active-bg !text-v2-text-primary",
					error: "!bg-v2-status-error-bg !text-v2-text-primary",
					info: "!bg-v2-bg-warm !text-v2-text-primary",
					actionButton: "!bg-v2-brand-teal !text-white !rounded-v2-md !text-xs !font-medium",
					cancelButton:
						"!bg-v2-bg-input-solid !text-v2-text-secondary !rounded-v2-md !text-xs !font-medium !border-v2-border-warm",
					closeButton: "!text-v2-text-secondary hover:!text-v2-text-primary hover:!bg-v2-bg-input-solid",
				},
				duration,
			}}
		/>
	);
}

V2Toaster.displayName = "V2Toaster";
