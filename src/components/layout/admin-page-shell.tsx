import { PageBreadcrumbs } from "@v2/components/navigation";
import { cn } from "@v2/lib/utils";
import type { ReactNode } from "react";

interface AdminPageShellProps {
	title: string;
	subtitle?: ReactNode;
	center?: ReactNode;
	actions?: ReactNode;
	titlePrefix?: ReactNode;
	breadcrumbLeafLabel?: string;
	density?: "default" | "compact";
	fillViewport?: boolean;
	children: ReactNode;
}

const SHELL_DENSITY_CLASSES = {
	default: "gap-5 px-5 pt-2.5 pb-5 md:px-6 md:pt-3 md:pb-6",
	compact: "gap-3.5 pt-2.5 pr-2 pb-1 pl-3 md:pt-3 md:pr-2.5 md:pb-1.5 md:pl-3",
} as const;

function AdminPageShell({
	title,
	subtitle,
	center,
	actions,
	titlePrefix,
	breadcrumbLeafLabel,
	density = "default",
	fillViewport = false,
	children,
}: AdminPageShellProps) {
	return (
		<div
			className={cn(
				"flex flex-1 flex-col",
				SHELL_DENSITY_CLASSES[density],
				fillViewport && "h-[calc(100dvh-3rem)] flex-none md:h-dvh",
			)}
		>
			<PageBreadcrumbs leafLabel={breadcrumbLeafLabel} />
			<header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div className="flex shrink-0 items-center gap-2.5">
					{titlePrefix}
					<div className="flex flex-col gap-0.5">
						<h1 className="font-v2-heading text-lg font-medium tracking-tight text-v2-text-primary md:text-xl">
							{title}
						</h1>
						{subtitle ? <div className="font-v2-body text-sm text-v2-text-secondary">{subtitle}</div> : null}
					</div>
				</div>
				{center ? <div className="flex min-w-0 flex-1 items-center justify-center">{center}</div> : null}
				{actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
			</header>
			<div className={cn("min-w-0 flex-1", fillViewport && "flex min-h-0 flex-col")}>{children}</div>
		</div>
	);
}

AdminPageShell.displayName = "AdminPageShell";

export { AdminPageShell, type AdminPageShellProps };
