import { cn } from "@v2/lib/utils";

interface SectionHeadingProps {
	as?: "h2" | "h3";
	children: React.ReactNode;
	className?: string;
}

function SectionHeading({ as: Tag = "h2", children, className }: SectionHeadingProps) {
	return (
		<Tag
			className={cn(
				"font-v2-body text-xl font-normal tracking-tight text-v2-text-primary sm:text-2xl sm:tracking-tight",
				className,
			)}
		>
			{children}
		</Tag>
	);
}
SectionHeading.displayName = "SectionHeading";

export { SectionHeading };
