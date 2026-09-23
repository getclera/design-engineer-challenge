"use client";

import { cn } from "@v2/lib/utils";
import { useState } from "react";

interface LogoWithFallbackProps {
	src: string | null;
	alt: string;
	fallbackInitial: string;
	href?: string | null;
	onClick?: () => void;
	sizeClassName?: string;
	fallbackTextClassName?: string;
	className?: string;
	loading?: "eager" | "lazy";
}

const failedLogoSrcs = new Set<string>();

function LogoWithFallback({
	src,
	alt,
	fallbackInitial,
	href,
	onClick,
	sizeClassName = "size-12",
	fallbackTextClassName,
	className,
	loading = "eager",
}: LogoWithFallbackProps) {
	const [erroredSrc, setErroredSrc] = useState<string | null>(null);
	const showImage = src && erroredSrc !== src && !failedLogoSrcs.has(src);
	const isInteractive = Boolean(href) || Boolean(onClick);

	const inner = (
		<div
			role="img"
			aria-label={alt}
			className={cn(
				"relative flex shrink-0 items-center justify-center overflow-hidden rounded-v2-md border border-v2-border-warm bg-v2-bg-card",
				sizeClassName,
				className,
				isInteractive && "transition-opacity hover:opacity-80",
			)}
		>
			<span
				aria-hidden="true"
				className={cn("font-v2-body font-medium text-v2-text-muted", fallbackTextClassName ?? "text-base")}
			>
				{fallbackInitial.toUpperCase()}
			</span>
			{showImage && (
				// biome-ignore lint/performance/noImgElement: logos come from arbitrary external hosts; next/image would require an allowlist
				<img
					key={src}
					src={src}
					alt=""
					loading={loading}
					decoding="async"
					onError={() => {
						failedLogoSrcs.add(src);
						setErroredSrc(src);
					}}
					className="absolute inset-0 h-full w-full bg-v2-bg-card object-contain"
				/>
			)}
		</div>
	);

	if (onClick) {
		return (
			<button // v2-precheck-ignore raw-html-form
				type="button"
				onClick={onClick}
				aria-label={alt}
				className="rounded-v2-md"
			>
				{inner}
			</button>
		);
	}

	if (href) {
		return (
			<a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${alt} on LinkedIn`}>
				{inner}
			</a>
		);
	}

	return inner;
}
LogoWithFallback.displayName = "LogoWithFallback";

export { LogoWithFallback };
