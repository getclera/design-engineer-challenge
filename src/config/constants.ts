export const USER_IDS = {
	CLERA_OWNER_ID: "699fa3d8-1e15-4689-9413-9e44c13f7df6",
} as const;

export const CONTACT_NUMBERS = {
	IMESSAGE: "+16505397073",
	WHATSAPP: "+16282872784",
	IMESSAGE_COMPANY: "+16505397073",
	WHATSAPP_COMPANY: "+16282258806",
} as const;

const CONTACT_MESSAGES = [
	"Hey Clera, curious what's out there for my background.",
	"Hey Clera, let's explore some opportunities.",
] as const;

const getDefaultContactMessage = (): string => {
	return CONTACT_MESSAGES[Math.floor(Math.random() * CONTACT_MESSAGES.length)] || CONTACT_MESSAGES[0];
};

export const DEFAULT_CONTACT_MESSAGE = getDefaultContactMessage();

export const PLACEMENT_FEE_PERCENTAGE = 15;

export const PAYMENT_CYCLE_DAYS = 30;

export const CURRENT_TERMS_VERSION = "2026-02-21-v1";

export const FALLBACK_TALENT_COUNT = 214738;
export const FALLBACK_TALENT_DISPLAY = "214,738+";

export const BOOK_CALL_URL = "https://cal.com/team/clera/quick-chat";
export const BOOK_CEO_CALL_URL = "https://cal.com/clera-ai/15min";
export const PRODUCT_HUNT_URL = "https://www.producthunt.com/products/clera";
export const LAUNCH_CAMPAIGN_TYPE = "launch_campaign_2026_04_28";

export {
	BUG_BOUNTY_EMAIL,
	PRESS_EMAIL,
	PRIVACY_EMAIL,
	SUPPORT_EMAIL,
	TALENT_EMAIL,
	UNSUBSCRIBE_EMAIL,
} from "@clera/shared-utils";

export const COMPANY_NAME = "Clera Labs, Inc.";
export const COMPANY_ADDRESS = "1111B S Governors Ave STE 40598";
export const COMPANY_CITY_STATE_ZIP = "Dover, DE 19904";
