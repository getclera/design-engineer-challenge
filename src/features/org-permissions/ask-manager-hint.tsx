"use client";

import { LockSimple } from "@phosphor-icons/react";
import { cn } from "@v2/lib/utils";
import { Fragment } from "react";
import { type ManagerScope, useOrgManagers } from "./use-org-managers";

interface AskManagerHintProps {
	orgId: string;
	action: string;
	scope?: ManagerScope;
	className?: string;
}

function AskManagerHint({ orgId, action, scope = "managers", className }: AskManagerHintProps) {
	const managers = useOrgManagers(orgId, scope);
	const allowed = scope === "owners" ? "owners" : "owners and members";

	return (
		<div className={cn("flex items-start gap-2 rounded-v2-md bg-v2-bg-warm px-3 py-2.5", className)}>
			<LockSimple className="mt-0.5 size-4 flex-shrink-0 text-v2-text-tertiary" />
			<div className="flex flex-col gap-0.5">
				<p className="font-v2-body text-xs text-v2-text-primary">
					Only {allowed} can {action}.
				</p>
				{managers.length === 0 ? (
					<p className="font-v2-body text-xs text-v2-text-tertiary">
						Ask {scope === "owners" ? "an owner" : "an owner or member"} of your organization to do it for you.
					</p>
				) : (
					<p className="font-v2-body text-xs text-v2-text-tertiary">
						Ask{" "}
						{managers.map((manager, index) => (
							<Fragment key={manager.id}>
								{index > 0 && ", "}
								{manager.email ? (
									<a
										href={`mailto:${manager.email}`}
										className="font-medium text-v2-text-secondary underline underline-offset-2 hover:text-v2-text-primary"
									>
										{manager.name}
									</a>
								) : (
									<span className="font-medium text-v2-text-secondary">{manager.name}</span>
								)}{" "}
								<span>({manager.roleLabel})</span>
							</Fragment>
						))}{" "}
						to do it for you.
					</p>
				)}
			</div>
		</div>
	);
}
AskManagerHint.displayName = "AskManagerHint";

export { AskManagerHint };
