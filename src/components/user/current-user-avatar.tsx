"use client";

import { Avatar, AvatarFallback, AvatarImage, type AvatarProps } from "@v2/components/ui/avatar";
import { useUser } from "@v2/hooks/use-user";
import { cn } from "@v2/lib/utils";

interface CurrentUserAvatarProps extends Omit<AvatarProps, "children"> {
	fallbackClassName?: string;
}

function CurrentUserAvatar({ className, fallbackClassName, ...props }: CurrentUserAvatarProps) {
	const { name, initials, avatarUrl } = useUser();
	return (
		<Avatar {...props} className={className}>
			{avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
			<AvatarFallback className={cn("bg-v2-bg-active text-v2-text-primary", fallbackClassName)}>
				{initials}
			</AvatarFallback>
		</Avatar>
	);
}

CurrentUserAvatar.displayName = "CurrentUserAvatar";

export { CurrentUserAvatar, type CurrentUserAvatarProps };
