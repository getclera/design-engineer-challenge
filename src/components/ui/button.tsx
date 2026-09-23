"use client";

import { cn } from "@v2/lib/utils";
import { Slot } from "radix-ui";
import * as React from "react";
import { type ButtonVariantProps, buttonVariants } from "./button-variants";

const SlotPrimitive = Slot.Slot;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? SlotPrimitive : "button";
		return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
