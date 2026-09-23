"use client";

import { Certificate } from "@phosphor-icons/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@v2/components/ui/accordion";
import { Card } from "@v2/components/ui/card";
import { cn } from "@v2/lib/utils";

interface Certification {
	title: string;
	issuer: string | null;
	issueDate: string | null;
}

interface SecondarySectionsCardProps {
	certifications: Certification[];
	className?: string;
}

function SecondarySectionsCard({ certifications, className }: SecondarySectionsCardProps) {
	if (certifications.length === 0) return null;

	const issuers = [...new Set(certifications.map((c) => c.issuer).filter(Boolean))].slice(0, 3).join(", ");

	return (
		<Card variant="flat" className={cn("overflow-hidden", className)}>
			<Accordion type="single" collapsible>
				<AccordionItem value="certifications" className="border-b-0">
					<AccordionTrigger className="px-4 py-3 text-sm font-medium sm:px-5">
						<div className="flex items-center gap-2">
							<Certificate size={16} className="text-v2-text-secondary" />
							<span className="font-v2-heading text-sm font-semibold text-v2-text-primary">Certifications</span>
							<span className="font-v2-body text-xs text-v2-text-muted">· {certifications.length}</span>
							{issuers && <span className="hidden font-v2-body text-xs text-v2-text-muted sm:inline">{issuers}</span>}
						</div>
					</AccordionTrigger>
					<AccordionContent className="px-4 pb-3 pt-0 sm:px-5">
						<div className="grid gap-3 sm:grid-cols-2">
							{certifications.map((cert) => (
								<div key={`${cert.title}-${cert.issuer}`} className="flex flex-col">
									<span className="font-v2-body text-sm text-v2-text-primary">{cert.title}</span>
									{cert.issuer && <span className="font-v2-body text-xs text-v2-text-muted">{cert.issuer}</span>}
								</div>
							))}
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</Card>
	);
}
SecondarySectionsCard.displayName = "SecondarySectionsCard";

export { SecondarySectionsCard };
