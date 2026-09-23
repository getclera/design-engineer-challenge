"use client";

import { buildBreadcrumbs } from "@v2/lib/navigation";
import { usePathname } from "next/navigation";
import { BreadcrumbNav } from "./breadcrumb-nav";

interface PageBreadcrumbsProps {
	leafLabel?: string;
	className?: string;
}

function PageBreadcrumbs({ leafLabel, className }: PageBreadcrumbsProps) {
	const pathname = usePathname();
	const items = buildBreadcrumbs(pathname, { leafLabel });
	if (!items) return null;
	return <BreadcrumbNav items={items} className={className} />;
}
PageBreadcrumbs.displayName = "PageBreadcrumbs";

export { PageBreadcrumbs };
