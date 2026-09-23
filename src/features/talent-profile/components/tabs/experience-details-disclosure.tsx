"use client";

import { CaretDown, CaretRight } from "@phosphor-icons/react";
import { Button } from "@v2/components/ui/button";
import { type MouseEvent, useCallback, useState } from "react";
import { isRepeatClick } from "@/utils/mouse";
import { ExperienceDetailsBody } from "./experience-details-body";

interface ExperienceDetailsDisclosureProps {
	description: string | null;
	resumeBullets: string[];
}

function ExperienceDetailsDisclosure({ description, resumeBullets }: ExperienceDetailsDisclosureProps) {
	const [detailsOpen, setDetailsOpen] = useState(false);
	const CaretIcon = detailsOpen ? CaretDown : CaretRight;
	const toggleDetails = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		if (isRepeatClick(event)) return;
		setDetailsOpen((v) => !v);
	}, []);

	if (!description && resumeBullets.length === 0) {
		return null;
	}

	return (
		<>
			<Button
				variant="ghost"
				size="sm"
				onClick={toggleDetails}
				className="h-5 w-fit gap-0.5 border-0 bg-transparent p-0 font-v2-body text-2xs font-normal text-v2-text-muted shadow-none hover:bg-transparent hover:text-v2-text-secondary"
				aria-expanded={detailsOpen}
			>
				<CaretIcon size={10} />
				Details
			</Button>
			{detailsOpen && <ExperienceDetailsBody description={description} resumeBullets={resumeBullets} />}
		</>
	);
}
ExperienceDetailsDisclosure.displayName = "ExperienceDetailsDisclosure";

export { ExperienceDetailsDisclosure };
