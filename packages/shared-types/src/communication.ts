import { z } from "zod";

export const NO_MOBILE_CONVERSATION = "no_mobile_conversation" as const;
export const NO_INSTANTLY_THREAD = "no_instantly_thread" as const;
export const SEND_ERROR_CODES = [NO_MOBILE_CONVERSATION, NO_INSTANTLY_THREAD] as const;
export type SendErrorCode = (typeof SEND_ERROR_CODES)[number];

export const GENERIC_AUTOMATION_REPLY_TYPES: readonly string[] = [
	"agent_message_sent_by_cleon",
	"agent_message_sent_by_leo",
	"agent_message_sent",
	"human_reply",
	"cleo_agent_reply",
];

export function isNotableAutomationType(type: string): boolean {
	return !GENERIC_AUTOMATION_REPLY_TYPES.includes(type);
}

export const deliveryModeSchema = z.enum(["slack", "email", "ats"]);
export type DeliveryMode = z.infer<typeof deliveryModeSchema>;

export const slackInviteStatusSchema = z.enum(["none", "sent", "already_in_channel", "failed"]);
export type SlackInviteStatus = z.infer<typeof slackInviteStatusSchema>;

export function slackInviteMessage({
	status,
	channelName,
	userEmail,
}: {
	status: SlackInviteStatus;
	channelName?: string | null;
	userEmail?: string | null;
}): string {
	const channel = channelName ? `#${channelName}` : "your hiring channel";
	switch (status) {
		case "sent":
			return userEmail
				? `${channel} is ready and the Slack Connect invite is on its way to ${userEmail}. It's good for 14 days.`
				: `${channel} is ready and the Slack Connect invite is on its way. It's good for 14 days.`;
		case "already_in_channel":
			return `You're already in ${channel} on Slack, so there's nothing to accept.`;
		case "failed":
			return userEmail
				? `Slack wouldn't take the invite to ${userEmail} just now. ${channel} is there, so it's worth another go in a minute.`
				: `Slack wouldn't take the invite just now. ${channel} is there, so it's worth another go in a minute.`;
		case "none":
			return `${channel} is ready on Slack.`;
	}
}

export enum CompanyCommunicationChannel {
	SLACK = "slack",
	EMAIL = "email",
	ATS = "ats",
	WHATSAPP = "whatsapp",
	IMESSAGE = "imessage",
}

export enum CompanyMessageType {
	TALENT_SUBMISSION = "talent_submission",

	DIGEST = "digest",

	INTRO_REQUEST = "intro_request",
	INTERVIEW_UPDATE = "interview_update",
	OFFER_NOTIFICATION = "offer_notification",
	GENERAL_UPDATE = "general_update",
}
