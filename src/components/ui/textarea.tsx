import { cn } from "@v2/lib/utils";
import * as React from "react";

type TextareaTone = "grey" | "warm";
type TextareaSize = "default" | "compact";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	tone?: TextareaTone;
	textareaSize?: TextareaSize;
	autoGrow?: boolean;
}

function resizeTextarea(el: HTMLTextAreaElement) {
	el.style.height = "auto";
	el.style.height = `${el.scrollHeight}px`;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, tone = "grey", textareaSize = "default", autoGrow, onInput, ...props }, ref) => {
		const resolvedAutoGrow = autoGrow ?? textareaSize === "compact";
		const internalRef = React.useRef<HTMLTextAreaElement | null>(null);

		const setRef = React.useCallback(
			(node: HTMLTextAreaElement | null) => {
				internalRef.current = node;
				if (typeof ref === "function") ref(node);
				else if (ref) ref.current = node;
				if (node && resolvedAutoGrow) {
					requestAnimationFrame(() => resizeTextarea(node));
				}
			},
			[ref, resolvedAutoGrow],
		);

		// biome-ignore lint/correctness/useExhaustiveDependencies: resize on controlled value changes
		React.useEffect(() => {
			if (resolvedAutoGrow && internalRef.current) {
				resizeTextarea(internalRef.current);
			}
		}, [resolvedAutoGrow, props.value]);

		const handleInput = React.useCallback<NonNullable<React.ComponentProps<"textarea">["onInput"]>>(
			(e) => {
				if (resolvedAutoGrow) resizeTextarea(e.currentTarget);
				onInput?.(e);
			},
			[resolvedAutoGrow, onInput],
		);

		return (
			<textarea // v2-precheck-ignore raw-html-form
				className={cn(
					"flex w-full",
					tone === "grey"
						? "bg-v2-bg-input-solid border border-transparent rounded-v2-md"
						: "bg-v2-bg-input border border-v2-border-warm rounded-v2-md",
					textareaSize === "compact" ? "min-h-10 px-2.5 py-2 text-sm" : "min-h-20.75 px-4 py-3 text-base",
					"font-v2-body text-v2-text-body",
					"placeholder:text-v2-text-muted",
					"focus-visible:outline-none focus-visible:border-v2-status-active focus-visible:ring-1 focus-visible:ring-v2-status-active",
					"disabled:cursor-not-allowed disabled:opacity-50",
					resolvedAutoGrow ? "resize-none overflow-hidden" : "resize-y",
					className,
				)}
				ref={setRef}
				onInput={handleInput}
				{...props}
			/>
		);
	},
);
Textarea.displayName = "Textarea";

export type { TextareaProps, TextareaSize };
export { Textarea };
