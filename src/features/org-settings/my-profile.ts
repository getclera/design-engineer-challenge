import type { MyNotifications } from "./delivery";

/** Settings › Profile, and your own Notifications in Communications. */
export interface MyProfile {
	id: string;
	name: string;
	email: string;
	title: string;
	avatarUrl: string | null;
	role: "owner" | "viewer";
	notifications: MyNotifications;
	/** Only when you're a hiring-manager contact: your scheduling link, the same one Members › Contacts shows. */
	contactId: string | null;
	calendarLink: string | null;
	/** Roles candidates meet you for. */
	roles: { id: string; position: string }[];
	/** You can't leave while you're the only owner. */
	onlyOwner: boolean;
}

export type MyProfileUpdate = Partial<
	Pick<MyProfile, "name" | "title" | "avatarUrl" | "calendarLink"> & { notifications: Partial<MyNotifications> }
>;

/** "Robin  Keller" → first "Robin", last "Keller". One word is a first name. */
export function splitName(name: string): { firstName: string; lastName: string } {
	const [firstName = "", ...rest] = name.trim().split(/\s+/);
	return { firstName, lastName: rest.join(" ") };
}
