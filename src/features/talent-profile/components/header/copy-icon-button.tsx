"use client";

import { Check } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { useCopyToClipboard } from "@v2/hooks/use-copy-to-clipboard";
import { cn } from "@v2/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ToolbarTooltip } from "./toolbar-tooltip";

const copyIconButtonVariants = cva("transition-colors", {
	variants: {
		variant: {
			default:
				"text-v2-text-secondary border border-v2-border-warm hover:bg-v2-bg-input-solid hover:text-v2-text-primary",
			inline: "text-v2-text-tertiary border-0 hover:text-v2-text-primary",
		},
		buttonSize: {
			default: "",
			sm: "!size-6",
		},
	},
	defaultVariants: {
		variant: "default",
		buttonSize: "default",
	},
});

const countPillClass = "rounded-full border px-2.5 text-xs font-medium h-8 gap-1";

const countPillVariants = cva(countPillClass, {
	variants: {
		countTone: {
			default: "border-v2-border-warm text-v2-text-secondary hover:bg-v2-bg-input-solid hover:text-v2-text-primary",
			warning:
				"border-v2-status-warning/40 bg-v2-status-warning-bg text-v2-status-warning hover:bg-v2-status-warning-bg",
		},
	},
	defaultVariants: { countTone: "default" },
});

type CopyIconButtonVariantProps = VariantProps<typeof copyIconButtonVariants>;
type CountPillVariantProps = VariantProps<typeof countPillVariants>;

interface CopyIconButtonProps extends CopyIconButtonVariantProps, CountPillVariantProps {
	getText: () => string | null;
	icon: React.ReactNode;
	label: string;
	title: string;
	description?: string;
	successMessage: string;
	errorMessage?: string;
	count?: number;
}

function CopyIconButton({
	getText,
	icon,
	label,
	title,
	description,
	successMessage,
	errorMessage,
	variant,
	buttonSize,
	count,
	countTone,
}: CopyIconButtonProps) {
	const { copied, copy } = useCopyToClipboard({ successMessage, errorMessage });
	const showCount = count !== undefined;
	const checkSize = buttonSize === "sm" || showCount ? 14 : 16;

	const button = (
		<Button
			variant="ghost"
			size={showCount ? "sm" : buttonSize === "sm" ? "compact-icon" : "toolbar-icon"}
			onClick={() => copy(getText())}
			className={cn(
				showCount ? countPillVariants({ countTone }) : copyIconButtonVariants({ variant, buttonSize }),
				copied && "text-v2-status-active",
			)}
			aria-label={showCount ? `${label} (${count} roles)` : label}
			title={description ? undefined : copied ? "Copied!" : title}
		>
			{showCount && <span className="text-xs font-semibold tabular-nums">{count}</span>}
			{copied ? <Check size={checkSize} weight={showCount ? "bold" : "regular"} /> : icon}
		</Button>
	);

	if (!description) return button;

	return (
		<ToolbarTooltip name={copied ? "Copied!" : title} description={description}>
			{button}
		</ToolbarTooltip>
	);
}

CopyIconButton.displayName = "CopyIconButton";

const iconButtonClass = copyIconButtonVariants({ variant: "default" });

export { CopyIconButton, copyIconButtonVariants, countPillClass, iconButtonClass };
