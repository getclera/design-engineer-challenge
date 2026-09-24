import { cn } from "@v2/lib/utils";
import type { ComponentProps } from "react";

/** Keyboard key hint, e.g. <Kbd>Esc</Kbd>. Server-safe; pass className to change the surface. */
function Kbd({ className, ...props }: ComponentProps<"kbd">) {
	return (
		<kbd
			className={cn(
				"inline-flex items-center rounded bg-v2-bg-warm px-1.5 py-0.5 font-v2-body font-medium text-2xs text-v2-text-tertiary leading-4",
				className,
			)}
			{...props}
		/>
	);
}
Kbd.displayName = "Kbd";

export { Kbd };
