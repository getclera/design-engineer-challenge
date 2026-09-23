import type { MobileChannel } from "@clera/shared-types";
import { CONTACT_NUMBERS } from "@/config/constants";

export type ChannelId = MobileChannel;

export const CHANNELS = {
	whatsapp: { color: "#25D366" }, // Brand color
	imessage: { color: "#007AFF" }, // Brand color
} satisfies Partial<Record<ChannelId, { color: string }>>;

export type ActiveNumbers = Partial<Record<ChannelId, string>>;

function getNumber(channel: ChannelId, activeNumbers?: ActiveNumbers): string {
	if (activeNumbers?.[channel]) return activeNumbers[channel];
	return channel === "whatsapp" ? CONTACT_NUMBERS.WHATSAPP : CONTACT_NUMBERS.IMESSAGE;
}

export function buildChannelUrl(
	channel: ChannelId,
	message: string,
	options?: { useSmsScheme?: boolean; activeNumbers?: ActiveNumbers },
): string {
	const number = getNumber(channel, options?.activeNumbers);
	if (channel === "whatsapp") {
		const digits = number.replace(/\D/g, "");
		return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
	}
	if (options?.useSmsScheme) {
		return `sms:${number}?body=${encodeURIComponent(message)}`;
	}
	return `imessage://${number}?body=${encodeURIComponent(message)}`;
}
