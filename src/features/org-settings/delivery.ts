/** Settings › Communications: which kind of update goes to which channel, and how often. */
export const DELIVERY_KINDS = [
	{ key: "submissions", title: "Candidate submissions", sub: null },
	{ key: "lists", title: "Candidate lists", sub: null },
	{ key: "accepted", title: "Intro accepted", sub: "A candidate said yes to an intro." },
	{ key: "booked", title: "Intro booked", sub: "A candidate booked a call." },
] as const;
export type DeliveryKind = (typeof DELIVERY_KINDS)[number]["key"];

export const CHANNELS = ["slack", "email"] as const;
export type Channel = (typeof CHANNELS)[number];

export const FREQUENCIES = [
	{ key: "now", title: "Right away", sub: "One message per update" },
	{ key: "daily", title: "Daily digest", sub: "Every weekday at 9:00" },
	{ key: "weekly", title: "Weekly digest", sub: "Mondays at 9:00" },
] as const;
export type Frequency = (typeof FREQUENCIES)[number]["key"];

export interface Delivery {
	grid: Record<DeliveryKind, Record<Channel, boolean>>;
	slackChannel: string | null;
	emails: string[];
	frequency: Frequency;
}

/** A ticked box only reaches someone if its channel is set up: Slack connected, at least one email. */
export function reaches(delivery: Delivery, kind: DeliveryKind): boolean {
	const row = delivery.grid[kind];
	return (row.slack && !!delivery.slackChannel) || (row.email && delivery.emails.length > 0);
}

/** New candidates go nowhere: a blocker, counted in the sidebar badge next to roles that can't book intros. */
export const candidatesGoNowhere = (delivery: Delivery) => !reaches(delivery, "submissions");

/** Personal, in Communications › Notifications: everyone edits their own, viewers too. */
export interface MyNotifications {
	reviewReminders: boolean;
	onlyMyRoles: boolean;
}
