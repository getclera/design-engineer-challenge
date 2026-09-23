"use client";

import { APP_ROLES } from "@/types/user";
import { useUser } from "./use-user";

export function useUserRole() {
	const { profile } = useUser();
	const userRole = profile.role;

	const isAdmin = userRole === APP_ROLES.ADMIN;
	const isRecruiter = userRole === APP_ROLES.RECRUITER;

	return {
		isAdmin,
		isRecruiter,
		isTalent: userRole === APP_ROLES.TALENT,
		canManage: isAdmin || isRecruiter,
		userRole,
	};
}
