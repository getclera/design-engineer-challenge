"use client";

import { RichContent } from "@v2/components/data-display";

interface ExperienceDetailsBodyProps {
	description: string | null;
	resumeBullets: string[];
}

function ExperienceDetailsBody({ description, resumeBullets }: ExperienceDetailsBodyProps) {
	if (resumeBullets.length > 0) {
		return (
			<ul className="flex flex-col gap-0.5 font-v2-body text-2xs font-light leading-relaxed text-v2-text-secondary">
				{resumeBullets.map((bullet) => (
					<li key={bullet} className="flex gap-1.5">
						<span className="mt-1.5 size-1 shrink-0 rounded-full bg-v2-text-muted" />
						<span>{bullet}</span>
					</li>
				))}
			</ul>
		);
	}

	return <RichContent content={description} density="compact" />;
}
ExperienceDetailsBody.displayName = "ExperienceDetailsBody";

export { ExperienceDetailsBody };
