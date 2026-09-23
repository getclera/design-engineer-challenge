import { cn } from "@v2/lib/utils";
import { CleraIcon } from "./clera-icon";

type CleraCircleVariant = "dark" | "light";
type CleraCircleRounding = "full" | "light";

interface CleraCircleProps {
	variant?: CleraCircleVariant;
	rounding?: CleraCircleRounding;
	size?: string;
	iconSize?: string;
	className?: string;
}

const variantStyles: Record<CleraCircleVariant, string> = {
	dark: "bg-v2-brand-teal text-white",
	light: "bg-v2-bg-page text-v2-brand-teal border border-v2-border-warm/30",
};

const roundingStyles: Record<CleraCircleRounding, string> = {
	full: "rounded-full",
	light: "rounded-[0.5rem]",
};

function CleraCircle({
	variant = "dark",
	rounding = "full",
	size = "size-8",
	iconSize = "size-4",
	className,
}: CleraCircleProps) {
	return (
		<div
			className={cn(
				"flex shrink-0 items-center justify-center",
				roundingStyles[rounding],
				variantStyles[variant],
				size,
				className,
			)}
		>
			<CleraIcon className={iconSize} />
		</div>
	);
}
CleraCircle.displayName = "CleraCircle";

export { CleraCircle, type CleraCircleProps };
