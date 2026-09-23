import { cn } from "@v2/lib/utils";

interface FieldLabelProps {
	children: React.ReactNode;
	className?: string;
}

function FieldLabel({ children, className }: FieldLabelProps) {
	return <span className={cn("font-v2-body text-sm font-light text-v2-text-muted", className)}>{children}</span>;
}
FieldLabel.displayName = "FieldLabel";

export { FieldLabel };
