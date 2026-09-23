"use client";

import { User } from "@phosphor-icons/react";
import { cn } from "@v2/lib/utils";
import { getInitials, optimizedImageUrl } from "@v2/utils/format";
import { cva, type VariantProps } from "class-variance-authority";
import { Avatar as AvatarPrimitive } from "radix-ui";
import * as React from "react";

const AVATAR_MAX_RENDER_PX = 80;

const avatarVariants = cva("relative inline-flex shrink-0 overflow-hidden rounded-full", {
	variants: {
		size: {
			xs: "size-5.5",
			sm: "size-7.75",
			md: "size-9.5",
			lg: "size-10.75",
		},
	},
	defaultVariants: {
		size: "sm",
	},
});

export interface AvatarProps
	extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
		VariantProps<typeof avatarVariants> {}

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
	({ className, size, ...props }, ref) => (
		<AvatarPrimitive.Root ref={ref} className={cn(avatarVariants({ size, className }))} {...props} />
	),
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Image>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, src, ...props }, ref) => (
	<AvatarPrimitive.Image
		ref={ref}
		src={typeof src === "string" ? (optimizedImageUrl(src, AVATAR_MAX_RENDER_PX) ?? undefined) : src}
		className={cn("aspect-square size-full object-cover", className)}
		{...props}
	/>
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Fallback>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Fallback
		ref={ref}
		className={cn(
			"flex size-full items-center justify-center rounded-full",
			"bg-v2-bg-input-solid text-v2-text-secondary font-v2-body text-xs font-medium",
			"border border-v2-border-default",
			className,
		)}
		{...props}
	/>
));
AvatarFallback.displayName = "AvatarFallback";

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
	src?: string | null;
	name?: string | null;
	className?: string;
	fallbackClassName?: string;
	fallback?: React.ReactNode;
	alt?: string;
}

const UserAvatar = React.forwardRef<HTMLSpanElement, UserAvatarProps>(
	({ src, name, size, className, fallbackClassName, fallback, alt = "" }, ref) => {
		const initials = name ? getInitials(name) : "";
		const fallbackContent =
			fallback ?? (initials || <User weight="fill" className="size-1/2 opacity-60" aria-hidden="true" />);
		const decorative = alt === "";
		return (
			<Avatar ref={ref} size={size} className={className}>
				{src ? <AvatarImage src={src} alt={alt} /> : null}
				<AvatarFallback className={fallbackClassName} aria-hidden={decorative ? "true" : undefined}>
					{fallbackContent}
				</AvatarFallback>
			</Avatar>
		);
	},
);
UserAvatar.displayName = "UserAvatar";

export { Avatar, AvatarFallback, AvatarImage, avatarVariants, UserAvatar };
