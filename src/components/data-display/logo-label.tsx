"use client";

import { useState } from "react";

interface LogoLabelProps {
	logoUrl: string | null;
	label: string;
}

const failedLogoSrcs = new Set<string>();

export function LogoLabel({ logoUrl, label }: LogoLabelProps) {
	const [erroredSrc, setErroredSrc] = useState<string | null>(null);
	const showLogo = !!logoUrl && erroredSrc !== logoUrl && !failedLogoSrcs.has(logoUrl);
	return (
		<span className="flex min-w-0 items-center gap-1">
			{showLogo && (
				// biome-ignore lint/performance/noImgElement: external logo hosts aren't in the next/image allowlist
				<img
					src={logoUrl}
					alt=""
					width={14}
					height={14}
					className="size-3.5 shrink-0 rounded-v2-sm object-contain"
					onError={() => {
						failedLogoSrcs.add(logoUrl);
						setErroredSrc(logoUrl);
					}}
				/>
			)}
			<span className="truncate">{label}</span>
		</span>
	);
}

LogoLabel.displayName = "LogoLabel";
