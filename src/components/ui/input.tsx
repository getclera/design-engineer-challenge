import { cn } from "@v2/lib/utils";
import * as React from "react";

type InputTone = "grey" | "warm" | "unstyled";
type InputSize = "default" | "compact";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	tone?: InputTone;
	inputSize?: InputSize;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, tone = "grey", inputSize = "default", ...props }, ref) => {
		return (
			<input // v2-precheck-ignore raw-html-form
				type={type}
				className={cn(
					tone === "unstyled"
						? ""
						: [
								"flex w-full",
								tone === "grey"
									? "bg-v2-bg-input-solid border border-v2-border-default rounded-v2-md"
									: "bg-v2-bg-input border border-v2-border-warm rounded-v2-md",
								inputSize === "compact" ? "px-2.5 py-1.5 text-base md:text-sm" : "px-4 py-3 text-base",
								"font-v2-body font-light text-v2-text-body",
								"placeholder:text-v2-text-muted",
								"focus-visible:outline-none focus-visible:border-v2-status-active focus-visible:ring-1 focus-visible:ring-v2-status-active",
								"disabled:cursor-not-allowed disabled:opacity-50",
								"file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-v2-text-body",
							],
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

export type { InputProps, InputSize, InputTone };
export { Input };
