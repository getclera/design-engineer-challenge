"use client";

import { Buildings, IdentificationCard, Money } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { PreferencesData } from "@/services/api/talents";
import { formatCompensation } from "./preferences/preference-fields";

interface IdentityFactsRowProps {
	preferences: Pick<
		PreferencesData,
		"workEnvironment" | "salaryLowerBound" | "salaryUpperBound" | "salaryCurrency" | "visaSponsorshipNeeded"
	>;
}

function hasFacts({ preferences }: IdentityFactsRowProps): boolean {
	return Boolean(
		preferences.workEnvironment.length > 0 ||
			formatCompensation(preferences) ||
			preferences.visaSponsorshipNeeded !== null,
	);
}

function IdentityFactsRow({ preferences }: IdentityFactsRowProps) {
	const facts: Array<{ key: string; icon: ReactNode; text: string }> = [];

	if (preferences.workEnvironment.length > 0) {
		facts.push({
			key: "workEnv",
			icon: <Buildings size={13} weight="fill" />,
			text: preferences.workEnvironment.join(" / "),
		});
	}

	const compensation = formatCompensation(preferences);
	if (compensation) facts.push({ key: "comp", icon: <Money size={13} weight="fill" />, text: compensation });

	if (preferences.visaSponsorshipNeeded !== null) {
		facts.push({
			key: "visa",
			icon: <IdentificationCard size={13} weight="fill" />,
			text: preferences.visaSponsorshipNeeded ? "Visa sponsorship required" : "No visa sponsorship needed",
		});
	}

	if (facts.length === 0) return null;

	return (
		<div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1.5">
			{facts.map((fact) => (
				<span key={fact.key} className="inline-flex items-center gap-1.5 text-v2-text-secondary">
					<span className="shrink-0 opacity-70">{fact.icon}</span>
					<span className="font-v2-body text-xs font-light">{fact.text}</span>
				</span>
			))}
		</div>
	);
}
IdentityFactsRow.displayName = "IdentityFactsRow";

export { hasFacts, IdentityFactsRow };
