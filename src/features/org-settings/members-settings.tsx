"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { organizations, unwrap } from "@/services/api";
import { ViewOnlyNote } from "./company-settings";
import { focusField } from "./focus-field";
import { membersKey } from "./keys";
import { type Member, fullName } from "./people";
import { HiringManagers } from "./contacts-settings";
import { People } from "./team-members";

/** Settings › Members: who's in Clera, then Contacts (who candidates meet for each role, and their calendar link). */
export function MembersSettings({
	orgId,
	canEdit,
	meId,
	focus,
	focusRole,
}: {
	orgId: string;
	canEdit: boolean;
	meId: string;
	/** From Review or Home: `calendar` (with a role) or `hm`. */
	focus?: string;
	focusRole?: string;
}) {
	const { data: members = [] } = useQuery({
		queryKey: membersKey(orgId),
		queryFn: () =>
			organizations
				.listMembers<{ members: Member[] }>(orgId)
				.then(unwrap)
				.then((d) => d.members),
	});
	const owners = members.filter((m) => m.role === "owner");

	useEffect(() => {
		if (focus) focusField(focus === "hm" ? "hm" : "calendar", focusRole);
	}, [focus, focusRole]);

	return (
		<div className="flex flex-col gap-5">
			{!canEdit && <ViewOnlyNote ownerName={owners[0] ? fullName(owners[0]) : null} />}
			<People orgId={orgId} canEdit={canEdit} meId={meId} members={members} />
			<HiringManagers orgId={orgId} canEdit={canEdit} />
		</div>
	);
}

MembersSettings.displayName = "MembersSettings";
