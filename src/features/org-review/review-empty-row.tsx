"use client";

import { CaretRightIcon } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import Link from "next/link";
import type { ReactNode } from "react";

const ROW_CLASSES = "h-auto w-full justify-start gap-3 rounded-none border-0 px-4 py-3 hover:bg-v2-bg-input-solid";

interface ReviewEmptyRowProps {
	label: string;
	meta?: ReactNode;
	onClick?: () => void;
	href?: string;
}

export function ReviewEmptyRow({ label, meta, onClick, href }: ReviewEmptyRowProps) {
	const body = (
		<>
			<span className="min-w-0 flex-1 truncate text-left font-v2-body text-sm text-v2-text-primary">{label}</span>
			{meta}
			<CaretRightIcon size={14} weight="bold" className="shrink-0 text-v2-text-tertiary" />
		</>
	);

	if (href) {
		return (
			<Button variant="ghost" className={ROW_CLASSES} asChild>
				<Link href={href}>{body}</Link>
			</Button>
		);
	}

	return (
		<Button variant="ghost" className={ROW_CLASSES} onClick={onClick}>
			{body}
		</Button>
	);
}

ReviewEmptyRow.displayName = "ReviewEmptyRow";
