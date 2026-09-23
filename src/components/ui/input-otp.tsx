"use client";

import { cn } from "@v2/lib/utils";
import { OTPInput, OTPInputContext } from "input-otp";
import * as React from "react";

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
	({ className, containerClassName, ...props }, ref) => (
		<OTPInput
			ref={ref}
			containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
			className={cn("disabled:cursor-not-allowed", className)}
			{...props}
		/>
	),
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
	({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center gap-3", className)} {...props} />,
);
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
	React.ElementRef<"div">,
	React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
	const inputOTPContext = React.useContext(OTPInputContext);
	const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

	return (
		<div
			ref={ref}
			className={cn(
				"relative flex size-12 items-center justify-center rounded-v2-sm",
				"border border-v2-border-medium bg-v2-bg-input-solid",
				"font-v2-body text-lg text-v2-text-primary transition-all",
				isActive && "z-10 ring-2 ring-v2-brand-teal ring-offset-1",
				className,
			)}
			{...props}
		>
			{char}
			{hasFakeCaret && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="h-5 w-px animate-caret-blink bg-v2-text-primary duration-1000" />
				</div>
			)}
		</div>
	);
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<React.ElementRef<"span">, React.ComponentPropsWithoutRef<"span">>(
	({ ...props }, ref) => (
		<span ref={ref} {...props}>
			<span className="inline-block size-1 rounded-full bg-v2-border-medium" />
		</span>
	),
);
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
