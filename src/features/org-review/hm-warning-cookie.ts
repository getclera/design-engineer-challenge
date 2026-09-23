import { getCookie, setCookie } from "@/utils/cookies";

const COOKIE_NAME = "clera_hm_link_warning_dont_show";
const COOKIE_EXPIRY_DAYS = 365;

function isHmLinkWarningSuppressed() {
	return getCookie(COOKIE_NAME) === "true";
}

function suppressHmLinkWarning() {
	setCookie(COOKIE_NAME, "true", COOKIE_EXPIRY_DAYS);
}

export { isHmLinkWarningSuppressed, suppressHmLinkWarning };
