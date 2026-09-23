import { z } from "zod";

export function getFeedbackPageContext(pathname: string | null, selectedRole?: string | null) {
	const role = z.guid().safeParse(selectedRole);
	const roleId = role.success ? role.data : undefined;
	const query = roleId ? new URLSearchParams({ role: roleId }).toString() : "";
	return { pagePath: pathname ? `${pathname}${query ? `?${query}` : ""}` : undefined, roleId };
}
