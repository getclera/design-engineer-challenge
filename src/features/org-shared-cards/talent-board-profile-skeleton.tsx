"use client";

import { Card } from "@v2/components/ui/card";
import { Skeleton } from "@v2/components/ui/skeleton";
import { type IdentityHeaderData, IdentityPublicZone } from "@v2/features/talent-profile";

interface TalentBoardProfileSkeletonProps {
	name: string | null;
	identiconSeed?: string | null;
	oneLiner: string | null;
	avatarUrl: string | null;
}

function TalentBoardProfileSkeleton({ name, identiconSeed, oneLiner, avatarUrl }: TalentBoardProfileSkeletonProps) {
	const headerData: IdentityHeaderData = {
		firstname: null,
		lastname: null,
		occupation: oneLiner,
		location: null,
		avatarUrl,
		openForOpportunities: null,
		linkedinUrl: null,
		portfolioUrl: null,
		githubUrl: null,
		xUrl: null,
		otherLinks: [],
	};

	return (
		<div className="mx-auto flex w-full max-w-230 flex-col gap-1.75 px-4 py-3 sm:px-6 sm:py-4">
			<Card variant="flat" className="overflow-hidden">
				<div className="px-4 py-2 sm:px-5 sm:py-2.5">
					<IdentityPublicZone
						data={headerData}
						displayNameOverride={name}
						identiconSeed={identiconSeed}
						occupationOverride={oneLiner}
						pending
					/>
				</div>
			</Card>

			<Skeleton className="h-40 w-full rounded-v2-lg" />
			<Skeleton className="h-28 w-full rounded-v2-lg" />
			<Skeleton className="h-24 w-full rounded-v2-lg" />
		</div>
	);
}
TalentBoardProfileSkeleton.displayName = "TalentBoardProfileSkeleton";

export type { TalentBoardProfileSkeletonProps };
export { TalentBoardProfileSkeleton };
