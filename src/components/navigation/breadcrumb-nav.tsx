import { CaretRight } from "@phosphor-icons/react/ssr";
import { cn } from "@v2/lib/utils";
import Link from "next/link";

export interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface BreadcrumbNavProps {
	items: BreadcrumbItem[];
	hideMiddleOnMobile?: boolean;
	className?: string;
}

function BreadcrumbNav({ items, hideMiddleOnMobile = true, className }: BreadcrumbNavProps) {
	if (items.length === 0) return null;

	return (
		<nav aria-label="Breadcrumb" className={cn("font-v2-body text-sm", className)}>
			<ol className="flex flex-wrap items-center gap-1.5">
				{items.map((item, i) => {
					const isLast = i === items.length - 1;
					const isMiddle = hideMiddleOnMobile && i > 0 && !isLast;

					return (
						<li
							key={item.href ?? item.label}
							className={cn("inline-flex items-center gap-1.5", isMiddle && "hidden sm:inline-flex")}
						>
							{i > 0 && (
								<CaretRight
									className={cn("size-3.5 text-v2-text-muted/60", isMiddle && "hidden sm:block")}
									aria-hidden="true"
								/>
							)}

							{isLast || !item.href ? (
								<span aria-current="page" className="font-normal text-v2-text-primary max-w-50 truncate sm:max-w-none">
									{item.label}
								</span>
							) : (
								<Link
									href={item.href}
									className="font-light text-v2-text-muted transition-colors hover:text-v2-text-primary"
								>
									{item.label}
								</Link>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
BreadcrumbNav.displayName = "BreadcrumbNav";

export { BreadcrumbNav };
