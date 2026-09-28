import { useEffect, useRef } from "react";

export interface Member {
	id: string;
	role: "owner" | "viewer";
	firstName: string;
	lastName: string;
	email: string;
	avatarUrl: string | null;
	joinedAt: string;
}
export interface Invitation {
	id: string;
	email: string;
	role: "owner" | "viewer";
	sentAt: string;
}

export const fullName = (p: { firstName: string; lastName: string | null; email: string }) =>
	`${p.firstName} ${p.lastName ?? ""}`.trim() || p.email;
export const firstName = (name: string) => name.split(" ")[0] || name;
export const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;

/** Forms opened by a click ("Someone new…", Invite): the next thing is typing, so the cursor goes there. */
export function useFirstFocus() {
	const ref = useRef<HTMLInputElement>(null);
	useEffect(() => ref.current?.focus(), []);
	return ref;
}
